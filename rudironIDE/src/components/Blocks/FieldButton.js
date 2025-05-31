

export class FieldButton extends Blockly.Field {
    constructor(text, onClick, optConfig) {
      super(text, optConfig);
      this.onClick = onClick;
      this.COLOR = "#27AE60"; 
      this.HOVER_COLOR = "#27AE60"; 
      this.PRESS_COLOR = "#219653"; 
    }
  
    initView() {
      this.createButtonElement();
    }
  
    createButtonElement() {
      // Create a group element for the entire button
      this.buttonGroup = Blockly.utils.dom.createSvgElement(
        'g',
        {
          'cursor': 'pointer',
          'class': 'blocklyButton'
        },
        this.fieldGroup_
      );

      // Rectangle for the button
      this.buttonElement = Blockly.utils.dom.createSvgElement(
        'rect',
        {
          'width': 95,
          'height': 32,
          'rx': 6, 
          'ry': 6,
          'fill': this.COLOR,
        },
        this.buttonGroup
      );
      
      // Text for the button with specific class to override CSS
      this.textElement_ = Blockly.utils.dom.createSvgElement(
        'text',
        {
          'x': 47,
          'y': 17,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          'class': 'blocklyButtonText', // Unique class for higher specificity
          'font-size': '19px',
          'font-weight': 'bold',
          'pointer-events': 'none'
        },
        this.buttonGroup
      );
      this.textElement_.textContent = this.getText();
  
      // Hover effect
      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'mouseenter',
        this,
        () => this.setButtonColor(this.HOVER_COLOR)
      );
      
      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'mouseleave',
        this,
        () => this.setButtonColor(this.COLOR)
      );
  
      // Press effect (scale down)
      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'mousedown',
        this,
        () => {
          this.setButtonColor(this.PRESS_COLOR);
          this.applyScale(0.95);
        }
      );

      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'mouseup',
        this,
        () => {
          this.setButtonColor(this.HOVER_COLOR);
          this.applyScale(1);
        }
      );

      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'click',
        this,
        (e) => {
          this.onClick();
          e.stopPropagation();
        }
      );
    }
  
    setButtonColor(color) {
      if (this.buttonElement) {
        this.buttonElement.setAttribute('fill', color);
      }
    }

    applyScale(scale) {
      if (this.buttonGroup) {
        this.buttonGroup.setAttribute('transform', `scale(${scale}) translate(${47 * (1 - scale)}, ${16 * (1 - scale)})`);
      }
    }
  
    updateSize_() {
      this.size_.width = 100;
      this.size_.height = 32;
    }
}