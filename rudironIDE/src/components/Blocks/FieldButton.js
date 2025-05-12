// FieldButton.js
export class FieldButton extends Blockly.Field {
    constructor(text, onClick, optConfig) {
      super(text, optConfig);
      this.onClick = onClick;
      this.COLOR = "#30c969"; 
      this.HOVER_COLOR = "#27AE60"; 
    }
  
    initView() {
      this.createButtonElement();
    }
  
    createButtonElement() {
      this.buttonElement = Blockly.utils.dom.createSvgElement(
        'rect',
        {
          'width': 95, // Ширина увеличена
          'height': 32, // Высота увеличена
          'rx': 6, 
          'ry': 6,
          'fill': "#30c969",
          'cursor': 'pointer',
          'class': 'blocklyButton'
        },
        this.fieldGroup_
      );
  
      // Текст кнопки
      this.textElement_ = Blockly.utils.dom.createSvgElement(
        'text',
        {
          'x': 47, // Центрирование по ширине
          'y': 17, // Центрирование по высоте
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          'fill': '#2ECC71',
          'font-size': '17px',
          'font-weight': 'bold', // Жирный шрифт
          'font-family': 'Inter, sans-serif'
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
      this.size_.width = 100;
      this.size_.height = 32;
    }
  }