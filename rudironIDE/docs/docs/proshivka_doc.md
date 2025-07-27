## **variable**
### Value

значения с переменным типом.

`value_data` - сочетание value_ptr (адрес буфера, в котором хранится значение), size (размер буфера) и type (тип значения: string, numeric, bool) в одной переменной. Для получения или перезаписи одной из характеристик можно использовать макросы `RUD_VAL_DATA_GET_...(value_data)` и `RUD_VAL_DATA_SET_...(value_data, ...)`.

> Значение базовой части чисолвых значений ограничено RUD_VALUE_NUMERIC_BASE_MAX или же -9223372036854775806 и 9223372036854775806.

> Минимальным значением дробной части числового значения является RUD_VALUE_NUMERIC_FRAC_EPSILON или же 0.0000001, что желательно учитывать при разработки новых операторов или блоков.

> Длина строчных значений ограничена RUD_VALUE_STRING_MAX_SIZE или же 2000 символами, но может быть увеличина до 16383, при дальнейшем увеличении нужно будет переписывать структуру `value_data`, а именно размер size части.

```c++
int setValue(BYTE *raw_value, RudValueType value_type,RudValueSize value_size); // напрямую задать буфер значения
int setNumeric(RudNumValBase base, RudNumValFrac frac); // зaдать число
int setString(BYTE *str_value, RudValueSize str_size); // задать строку
int setBool(bool new_value); // задать булевое значение
bool getBool(); // получить булевую репрезентацию значения
int deleteValue(); // полностью освободить значение
BYTE* getValue(); // получить указатель на буфер значения
RudValueType getType(); // получить тип значения
RudValueSize getSize(); // получить размер буфера значения
```

Value используется везде, где происходят вычисления или хранение значений. К примеру:
- Для хранения значений в структуре блока (аргумент значение - константа как аргумент блока или оператора. Например add(1.2, 634) или SerialPrint("aaa")) полученной после обработки запроса присланного клиентом.
- Для хранения значений переменных в VariableStorage.
- Для вычислении результата операторов в Executer.

### VariableStorage
Это связанный список пар Value и `next_name`.

`next_name` - комбинация next_pair (адрес следующей пары) и name (адрес буфера, хранящего имя переменной). Для получения или перезаписи одной из характеристик можно использовать макросы `RUD_VST_NEXTNAME_GET_...(next_name)` и `RUD_VST_NEXTNAME_SET_...(next_name, ...)`.

> Длина названия переменной ограничена RUD_VAR_STORAGE_MAX_NAME_SIZE или же 2000 символами.

> Количество переменных одновременно не может превышать RUD_VAR_STORAGE_MAX_NUM_VARS, или же 400 переменных. При увеличении максимального количества переменных, стоит также увеличить максимальный объем MemoryPool.

```c++
int addVariable(rud::Value **value, char *name); // добавить новую переменную. указатель на ее Value возвращается в **value
int deleteVariable(char *name); // удалить переменную с заданым именем
int deleteVariable(rud::Value *value_ptr); // удалить переменную у которой адрес Value равен *value_ptr
int findVariable(rud::Value **value, char *name); // найти переменную с заданым именем. указатель на ее Value будет помещен в **value
int clear(); // удалить все переменные
```

### Функции операторов

Для каждого оператора предусмотрена своя функция. Например, для оператора нахождения длины строки (RUD_EXECUTER_OPERATOR_ID_LENGTH) есть функция `lenStrValue()`.

```c++
int rud::lenStrValue(rud::Value **operands, DWORD out_i){
    if(out_i > 0){ return ERR_VAL_TOO_MUCH_OPERANDS; }

    rud::Value *lhs = operands[out_i];
    if(lhs == NULL){ return ERR_VAL_OPERAND_POINTER; }

    RudValueType lhs_type = RUD_VAL_DATA_GET_TYPE(lhs->value_data);
    RudValueSize lhs_size = RUD_VAL_DATA_GET_SIZE(lhs->value_data);
    BYTE *lhs_value = (BYTE*)rud::GlobalMemoryPool->getAddressPtr(RUD_VAL_DATA_GET_VALUE(lhs->value_data));
    
    if(lhs_type != RUD_VALUE_TYPE_STRING){ return ERR_VAL_OPERANDS_VALUE_TYPES; }
    
    // allocate a new value buffer
    RudValueSize new_size = RUD_VALUE_NUMERIC_BASE_SIZE+RUD_VALUE_NUMERIC_FRAC_SIZE;
    RudMemAddress new_value_address = RUD_MEMPOOL_ADDRESS_EMPTY;
    void *tmp_ptr = rud::GlobalMemoryPool->allocate(new_size, &new_value_address);
    if(tmp_ptr == NULL){ return ERR_VAL_ALLOCATE_VALUE; }

    // set the new value data
    *((RudNumValBase*)tmp_ptr) = (RudNumValBase)lhs_size;
    *((RudNumValFrac*)(((BYTE*)tmp_ptr)+RUD_VALUE_NUMERIC_BASE_SIZE)) = 0.0f;    
    
    rud::GlobalMemoryPool->free(lhs_value, lhs_size);
    RUD_VAL_DATA_SET_VALUE(lhs->value_data, new_value_address);
    RUD_VAL_DATA_SET_TYPE(lhs->value_data, RUD_VALUE_TYPE_NUMERIC);
    RUD_VAL_DATA_SET_SIZE(lhs->value_data, new_size);    

    return ERR_OK;
}
```

> Количество цифр после запятой при конвертации числа в строку `cvtStrValue()` равно 7.

> Логические значения пришедшие из вложеных логических операторов можно предаставить в виде числа (как это происходит во всех функциях арифметических операторов, к примеру в `addValue()`).

У каждой подобной функции среди аргументов должны быть `operands` и `out_i`. 
- `operands` - список указателей на Value каждого операнда оператора. К моменту выполнения любого оператора, все вложенные в него операторы уже выполнены, поэтому в `operands` находятся уже готовые посичтанные значения.
- `out_i`- индекс Value среди `operands`, в который нужно сохранить посчитанное функцией значение.

> Даже если у оператора не должно быть каких либо операндов, среди аргументов его функции все равно должны быть `operands` и `out_i`. Это обусловлено тем как просиходит расчет операторов внутри блока. 

## **memory_pool**

Кастомный менеджер памяти.

```c++
int initializePool(); // инициализировать пул
int finalizePool(); // освободить все блоки пула
void* allocate(DWORD size, RudMemAddress *out_address = NULL); // аллоцировать size количество байт и если *out_address не равен нулю передать в него адрес аллоцированного участка памяти
int free(void *ptr, DWORD size); // освободить ранее алооцированный участок памяти
template <class TYPE> 
int freeDestruct(TYPE *ptr, DWORD count); // освободить ранее алооцированный участок памяти, в котром хранится count количество объектов класса TYPE и вызвать деструктор для каждого обЪекта
int freeAddress(RudMemAddress address, DWORD size); // освободить участок памяти с заданым адресом
template <class TYPE>
int freeAddressDestruct(RudMemAddress address, DWORD count); // освободить ранее алооцированный участок памяти с заданым адресом, в котром хранится count количество объектов класса TYPE и вызвать деструктор для каждого обЪекта
void* getAddressPtr(RudMemAddress address); // получить указатель на участок памяти расположенного по адресу address
int expand(RudMemAddress *address, long long int shift, DWORD size); // по возможности расширить участок памяти (в случае неудачи вернется ERR_MEMPOOL_NO_FREE_SPACE_AFTER)
int shrink(RudMemAddress address, long long int shift, DWORD size); // усечь участок памяти, освободив только его часть
void freeAll(); // заново инициализировать пул
```

`RudMemAddress` - комбинация индекса блока и индекса чанка, который хранится в этом блоке.

> MemoryPool ограничен RUD_MEMPOOL_BLOCK_SIZE и RUD_MEMPOOL_POOL_MAX_NUM_BLOCKS, из-за этого объем памяти предоставленной для распределения (размер памяти, которую можно использовать для аллокации, а не сам размер занемаемой MemoryPool'ом памяти) не привышает 24 КБ.

## **pins_state**
### PinsController

Интерфейс для работы с пинами платы.

> Всю работу с пинами желательно пропускать через GLobalPinsController (главный объект данного класса), так как PinsController отвечает за предоставлении информации о состоянии пинов при отправке респонсов клиенту, основываясь при этом на ранее вызванных в других участках программы методах `setPinState()` и `updatePinsState()`.

#### Методы PinsController

```c++
int setPinMode(RudPinIndex pin, BYTE mode); 
```

Позволяет установить режим работы пина. `pin` - порядковый номер пина (A1 - 21, A2 - 22 и т.д. 9 и 10 пин также можно использовать), `mode` - режим работы пина: PinMode_Input - 0, PinMode_Output - 1, PinMode_Input_pullup - 2.

```c++
int setPinState(RudPinIndex pin, BYTE value, bool write_mode);
```

Устанавливает значение пина. `pin` - пин, `value` - значение которое требуется установить, `write_mode` - режим записи: 0 - аналоговая запись, 1 - цифровая запись.

| pin_type    | digital_write(a)        | analog_write(a)             |
|-------------|:-----------------------:|:---------------------------:|
| **digital** | (int)(a >= 1) **(0-1)** | **Error**                   |
| **analog**  | (int)(a >= 1) **(0-1)** | (int)(a >= 128) **(0-1)**   |
| **pwm**     | (int)(a >= 1) **(0-1)** | a               **(0-255)** |

```c++
int getPinState(RudPinIndex pin, BYTE *pin_state);
```

Читает значение пина. `pin` - пин, `*pin_state` - указаетль на место, куда будет записано значение пина.

| pin_type    | out_value |
|-------------|:---------:|
| **digital** | 0-1       |
| **analog**  | 0-255     |
| **pwm**     | 0-255     |

> При четнии pwm пинов частота ШИМа выбрана равной analogWrite_Frequency, то есть равной 490. (Возможно стоит брать частоту из аргументов, в таком случае  также нужно будет переписать операторы analogRead и analogWrite).

```c++
int updatePinsState();
```

Внутри PinsController существует буфер хранящий состояние каждого пина, из которого позже, при отправке респонса, берется ифнормация. Данный метод обновляет состояние каждого пина в данном буфере. В настоящий момент этот метод вызывается в начале работы с каждым реквестом, при этом в случаях analogWrite и подобных блоков, состояния задействованных в этом блоке пинов обновятся при вызове `setPinState()` другими участками программы.

```c++
BYTE* getPinsStateBuffer();
```

Возвращает упомянутый в описании предыдущего метода уже готовый буфер состояний пинов, предназначенный для отправки его клиенту. 

## **rs_node**
### RSNode

Интерфейс для отправки и получения пакетов.

> Размеры внутреннего буфера RSNode ограничены RUD_RSNODE_MAX_BUFFER_SIZE, то есть 8 КБ памяти.

#### Методы RSNode 

```c++
int requestEvent();
```

Пытается получить информацию по сериал и если никаких ошибок не возникло и во внутреннем буфере есть необработанные реквесты, возвращает RUD_RSNODE_REQ_AVAILABLE, а если реквестов нет, то RUD_RSNODE_REQ_NOT_AVAILABLE.

```c++
int getRequest(rud::Block **block_p, RudRequestId *req_id, RudBlockId *out_block_id);
```

Парсит следующий необработанный реквест и возвращает готовую для чтения Executer'ом структуру. `**block_p` - место, куда помещается указатель на блок структуры, `*req_id` - место, куда помещается id обработанного реквеста, `*out_block_id` - место, куда помещается id блока, описанного в реквесте (нужен так как, при получении реквестов с блоками RUD_EXECUTER_BLOCK_ID_EMPTY или RUD_EXECUTER_BLOCK_ID_RESET, в `**block_p` помещается NULL).

> У каждого реквеста (и респонса) есть сигнатура, поэтому при вызове `getRequest()`, в самом начале вся мусорная информация в буфере пропускается до момента возникновения сигнатуры следующего реквеста.

```c++
int sendResponse(RudRequestId request_id, int status, RudExecInfo exec_info, BYTE *pins_state);
```

Отправляет респонс клиенту. `request_id` - id блока полученного в реквесте, `status` - сатус выполнения блока (код ошибки), `exec_info` - дополнительная информация о выполнении блока (к примеру в случае блока if - это итоговое значение его условия), `*pins_state` - буфер состояния пинов (мeтод `getPinsStateBuffer()` класса PinsController). 

```c++
int freeStructure(rud::Block *block_p);
```

Освобождает структуру, полученную из реквеста через `**block_p` в методе `getRequest()`.

```c++
int configBluetooth(rud::Block *block_p);
```

Так как RSNode это не только интерфейс для отправки и получения пакетов по сериалу, а в принципе интерфес отправки и получения информации по среиалу, среди его методов есть `configBluetooth()`, который настраивает Bluetooth модуль подключенный к плате, в соответствии с информацией переданой в реквесте. `*block_p` - указатель на сруктуру полученную с помощью `getRequest()`.

```c++
void freeRequestBuffer();
```

Полностью отчищает внутренний буфер RSNode.

## **executer**

Участок кода отвечающий за само исполнения блока описанного в рекветсе прешедшем от клиента.

### Распаршенная структура

Структура полученная из реквеста с помощью метода `getRequest()` класса RSNode. Она почти полностью повторяет структуры пакета описанную в protocol.txt, но воплощенная в виде структур.

> Размеры распаршенной структуры ограничены по количеству аргументов (количеству всех вложенных объектов, то есть аргументы блока, операторы вложенные в этот блок, их аргументы и их вложенные операторы и т.д). Максимальное количество таких аргументов равно RUD_RSNODE_MAX_NUM_ARGS или же 150, из-за чего в максимально плохих случаях готовая структура занимает около 10 КБ памяти.

``` c++
struct rud::Block{
    RudBlockId  block_id;
    RudNumArgs  num_args;
    rud::Arg    **args;
};

struct rud::Arg{
    RudArgType arg_type;
};

struct rud::ArgValue : public rud::Arg{
    RudValueType  value_type;
    rud::Value    value;
};

struct rud::ArgVariable : public rud::Arg{
    char *name;
};

struct rud::ArgOperator : public rud::Arg{
    RudBlockId  operator_id;
    RudNumArgs  num_args;
    rud::Arg    **args;
};
```

Основу каждой стрктуры состовляет Block, в котором содержатся `block_id` - id блока (описаны в executer.h и в protocol.txt), `**args` - список указателей на аргументы блока и `num_args` - количество этих указателей. Каждый аргумент делится на 3 типа: ArgValue, ArgVariable и ArgOperator. Тип любого Arg записан в `arg_type` - тип аргумента, может быть равным: 0 - аргумент значение, 1 - аргумент переменная, 2 - аргумент оператор. В ArgValue дополнительно хранятся `value_type` - тип значения: 0 - число, 1 - строка и `value` - собствено само значение записанное в объект класса Value. В ArgVariable хранится `*name`- имя переменной, для дальнейшего поиска переменной в VariableStorage. А в ArgOperator хранятся `operator_id` - id оператора (описаны в executer.h и в protocol.txt), `**args` - список указателей на операнды оператора и `num_args` - количество этих указателей.

### Порядок исполнения реквеста

```c++
int execute(rud::Block *block_p, RudExecInfo *exec_info, RudExecInfoPtr *exec_info_ptr);
```

Певрое, куда приходит структура полученная от RSNode - это метод `execute()`. `*block_p` - указатель на основание структуры, `*exec_info` - место, куда бдует занесена дополнительная информация о выполнении блока, `*exec_info_ptr` - дополнение к `*exec_info`, куда можно поместить указатель на что-то. С этого метода начинается рекурсивное вычисление всех аргументов блока. Если аргумент является значением или переменной, то для него создается свое Value, куда копируется либо само значение полученное из реквеста, либо значение переменной с именем указаном в реквесте. Если же аргумент является оператором, то для него также создается Value и вызывается метод `executeOperator()`, в нем данный оператор рекурсивно вычисляется и его итоговое значение приходит в выделенный для этого аргумента Value. В самом конце вызывается метод `executeBlock()`, в котором и происходит исполнение самого блока, а после все созданные ранее на этом уровне Value освобождаются.

```c++
int executeOperator(rud::Value *out_value, rud::ArgOperator *argument);
```

Здесь рекурсивно выполнется ветка аргумента оператора. `*out_value` - указатель на Value, в который будет сохранено итоговое значение данного оператора (на данном уровне), а `*argument` - указатель на оператор в структуре, который нужно вычислить. Для каждого аргумента на данном уровне создается свой Value, куда как и в случае с блоком копируется значение этого аргумента, но если аргумент является оператором, то генерируется новая ветка вычислений. В конце текущий оператор вычисляется в методе `calculateOperator()` и полученное значение сохраняется в `*out_value`, а все созданные на данном уровне дополнительные Value освобождаются. 

Визуализация процеса исполнения аргумента `(((a + b) * 2) + (5 / ((a - c) - (c + 8)))) == 8`, где (+) - создание нового Value, () - использование Value из `*out_value`.

```
    (execute)                    /-(+)
        v                        |
(executeOperator)           /---( ) == 8
        |                   |
        |              /---( ) + (+)---\
        |              |               |
        |          /--( ) * 2     5 / ( )--\
        |          |                       |
        |        a + b                 /--( ) - (+)--\
        |                              |             |
        v                            a - c         c + 8
```

### Iterators

Это список пар `*value` и `variable` а также ряд методов для работы с этим списком. `*value` - указатель на Value переменной итератора в VariableStorage, а `variable` - это флаг, показывающий существовала ли переменная до цикла, или же была создана в его начале (0 - это переменная созданная для цикла, 1 - это переменная существовавшая до цикла). Если переменная существовала до, то она не удаляется и ее значение остается таким же, как и в последней итерации цикла, в противном случае переменная удаляется.

#### Методы для работы с итераторами

```c++
int addIterator(rud::Value *value, bool is_variable); // добавить запись о новом итераторе
int findIterator(rud::Value *value); // найти итератор *value которого равен *value переданному функции. если такой итератор существует, то возвращается RUD_EXECUTER_ITERATOR_EXISTS, иначе - RUD_EXECUTER_NO_SUCH_ITERATOR
int deleteLastIterator(); // удалить последний итератор в списке 
int getLastIteratorValuePtr(rud::Value **value); // получить *value последнего итератора (для того чтобы удалить переменную с помощью метода int deleteVariable(rud::Value *value_ptr)) 
bool getLastIteratorFlag(); // получить флаг variable последнего итератора
```

## **Добавление новых блоков / операторов**

Для начала нужно согласовать id нового блока с клиентом и добиавить его в executer.h (к примеру цикл while имеет id RUD_EXECUTER_BLOCK_ID_WHILE равный 302).

### Добавление блока

Блоки выполняются в методе `executeBlock()` класса Executer в файле executer.cpp.

* `**values` - список указателей к Value аргументов блока. Даже, если аргумент являлся рядом вложеных операторов (к примеру add( 12.03, mul( my_var, 3.5 ) )) в `executeBlock()` прийдет результат выполнения этих операторов.
* `*block_p` - указатель на сам блок.
* `*exec_info` - указаетль на 2 байтовую переменную, в которую можно сохранить дополнительную информацию о выполнении данного блока. Эта информация позже будет отправлена клиенту. К примеру блоки циклов с условием сохраняют `*exec_info` результат условия (0 или 1), чтобы клиент смог решить какой блок
нужно выполнять далее.
* `*exec_info_ptr` - дополнение к `*exec_info`, куда можно сохранить указатель на что то. В настоящий момент используется только блоком SerialPrint (RUD_EXECUTER_BLOCK_ID_WRITE_TEXT), который сохраняет туда указатель на Value со строкой котрую нужно "вывести".

> Все Value аргументов после выполнения блока будут освобождены, поэтому чтобы сохранить Value для дальнейщей работы, указатель на него в списке `**values` нужно звменить NULL'ом.

> Если новый блок может создавать новые переменные, то в дав условия `(ret == ERR_VARSTRG_NO_SUCH_NAME && (block_p->block_id == RUD_EXECUTER_BLOCK_ID_FOR || block_p->block_id == RUD_EXECUTER_BLOCK_ID_SET_VAR))` в методе `exeute()` в фале executer.cpp нужно добавить `|| block_p->block_id == RUD_EXECUTER_BLOCK_ID...`

### Добавление опеартора

операторы выполняются в методе `calculateOperator()` в файле executer.cpp.

- `operator_id` - id оператора.
- `**operands` - список указателей к Value операндов операторв. Даже, если операнд являлся рядом вложеных операторов, в `calculateOperator()` прийдет результат выполнения этих операторов.
- `out_operand_i` - индекс Value среди `**operands`, в который должен быть записан результат работы оператора.

Все функции в которых описана работа операторов находятся в файле variable.cpp (к примеру для оператора RUD_EXECUTER_OPERATOR_ID_ADD в variable.cpp есть функция `addValue()`).