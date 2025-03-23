// FieldButton.js
export class FieldButton extends Blockly.Field {
    constructor(text, onClick, optConfig) {
      super(text, optConfig);
      this.onClick = onClick;
      this.COLOR = "#2ECC71"; // Яркий зеленый цвет
      this.HOVER_COLOR = "#27AE60"; // Темнее при наведении
    }
  
    initView() {
      this.createButtonElement();
    }
  
    createButtonElement() {
      // Создаем основу кнопки
      this.buttonElement = Blockly.utils.dom.createSvgElement(
        'rect',
        {
          'width': 80, // Ширина увеличена
          'height': 32, // Высота увеличена
          'rx': 8, // Больше закругление углов
          'ry': 8,
          'fill': this.COLOR,
          'stroke': '#27AE60',
          'stroke-width': 2,
          'cursor': 'pointer',
          'class': 'blocklyButton'
        },
        this.fieldGroup_
      );
  
      // Текст кнопки
      this.textElement_ = Blockly.utils.dom.createSvgElement(
        'text',
        {
          'x': 40, // Центрирование по ширине
          'y': 20, // Центрирование по высоте
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          'fill': '#2ECC71"',
          'font-size': '14px',
          'font-weight': 'bold', // Жирный шрифт
          'font-family': 'Arial, sans-serif'
        },
        this.fieldGroup_
      );
      this.textElement_.textContent = this.getText();
  
      // Анимация при наведении
      Blockly.browserEvents.conditionalBind(
        this.buttonElement,
        'mouseenter',
        this,
        () => this.setButtonColor(this.HOVER_COLOR)
      );
      
      Blockly.browserEvents.conditionalBind(
        this.buttonElement,
        'mouseleave',
        this,
        () => this.setButtonColor(this.COLOR)
      );
  
      // Обработчик клика
      Blockly.browserEvents.conditionalBind(
        this.buttonElement,
        'click',
        this,
        (e) => {
          this.onClick();
          this.setButtonColor(this.COLOR);
          e.stopPropagation();
        }
      );
    }
  
    setButtonColor(color) {
      if (this.buttonElement) {
        this.buttonElement.setAttribute('fill', color);
      }
    }
  
    updateSize_() {
      this.size_.width = 80;
      this.size_.height = 32;
    }
  }