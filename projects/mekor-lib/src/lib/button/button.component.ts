import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'mekor-lib-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  standalone: true,
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() type: ButtonType = ButtonType.Primary;
  @Input() size: ButtonSize = ButtonSize.Medium;
  @Input() font: ButtonFontSize = ButtonFontSize.FS14;
  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  constructor(private readonly common: CommonModule) {
  }

  get buttonType(): string {
    return `type ${this.type}`;
  }

  get buttonSize(): string {
    return `size ${this.size}`;
  }

  get buttonFont(): string {
    return `font ${this.font}`;
  }

  buttonClicked($event: any) {
    this.buttonClick.emit($event);
  }
}

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Link = 'link'
}

export enum ButtonSize {
  ExtraSmall = 'xSmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'xLarge'
}

export enum ButtonFontSize {
  FS12 = 'fs12',
  FS14 = 'fs14',
  FS16 = 'fs16',
  FS18 = 'fs18',
}
