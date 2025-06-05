import 'blockly/blocks';
import 'blockly/javascript';
import 'blockly/msg/ru'; // Русская локализация
import * as Blockly from 'blockly/core';
export class FieldButton extends Blockly.Field {
    constructor(text, onClick, optConfig) {
      super(text, optConfig);
      this.onClick = onClick || (() => {}); // Single click handler
      this.isRunning = false;
      this.START_COLOR = "#30c969"; 
      this.START_HOVER_COLOR = "#27AE60"; 
      this.START_PRESS_COLOR = "#219653";
      this.STOP_COLOR = "#FF4D4D";
      this.STOP_HOVER_COLOR = "#CC0000";
      this.STOP_PRESS_COLOR = "#990000";
      this.mouseDownPos = null; // Track mouse position for drag detection
      this.isDragging = false;
    }
  
    initView() {
      this.createButtonElement();
    }

    toggle(){
      this.isRunning = !this.isRunning;
      this.textElement_.textContent = this.isRunning ? 'СТОП' : 'СТАРТ';
      this.setButtonColor(this.isRunning ? this.STOP_COLOR : this.START_COLOR);
    }
  
    createButtonElement() {
      this.buttonGroup = Blockly.utils.dom.createSvgElement(
        'g',
        {
          'cursor': 'pointer',
          'class': 'blocklyButton'
        },
        this.fieldGroup_
      );

      this.buttonElement = Blockly.utils.dom.createSvgElement(
        'rect',
        {
          'width': 95,
          'height': 32,
          'rx': 6, 
          'ry': 6,
          'fill': this.START_COLOR,
        },
        this.buttonGroup
      );
  
      this.textElement_ = Blockly.utils.dom.createSvgElement(
        'text',
        {
          'x': 47,
          'y': 17,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          'class': 'blocklyButtonText',
          'fill': '#FFFFFF',
          'font-size': '17px',
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
        () => {
          if (!this.isDragging) {
            this.setButtonColor(this.isRunning ? this.STOP_HOVER_COLOR : this.START_HOVER_COLOR);
          }
        }
      );
      
      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'mouseleave',
        this,
        () => {
          if (!this.isDragging) {
            this.setButtonColor(this.isRunning ? this.STOP_COLOR : this.START_COLOR);
          }
        }
      );
  
      // Track mouse down for drag detection and press effect
      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'mousedown',
        this,
        (e) => {
          this.mouseDownPos = { x: e.clientX, y: e.clientY };
          this.isDragging = false;
          this.setButtonColor(this.isRunning ? this.STOP_PRESS_COLOR : this.START_PRESS_COLOR);
          this.applyScale(0.95);
        }
      );

      // Detect drag by checking mouse movement
      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'mousemove',
        this,
        (e) => {
          if (this.mouseDownPos) {
            const dx = e.clientX - this.mouseDownPos.x;
            const dy = e.clientY - this.mouseDownPos.y;
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
              this.isDragging = true;
            }
          }
        }
      );

      // Handle click only if not dragging
      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'click',
        this,
        (e) => {
          if (!this.isDragging && this.sourceBlock_.isInFlyout === false) {
            this.isRunning = !this.isRunning;
            this.textElement_.textContent = this.isRunning ? 'СТОП' : 'СТАРТ';
            this.setButtonColor(this.isRunning ? this.STOP_COLOR : this.START_COLOR);
            this.onClick(this.isRunning); // Pass isRunning to the single handler
            e.stopPropagation(); // Only for clicks, not drags
          }
        }
      );

      // Reset on mouse up
      Blockly.browserEvents.conditionalBind(
        this.buttonGroup,
        'mouseup',
        this,
        () => {
          if (!this.isDragging) {
            this.setButtonColor(this.isRunning ? this.STOP_HOVER_COLOR : this.START_HOVER_COLOR);
            this.applyScale(1);
          }
          this.mouseDownPos = null;
          this.isDragging = false;
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