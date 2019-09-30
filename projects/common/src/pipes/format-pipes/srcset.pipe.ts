import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'srcset'})
export class SrcsetPipe implements PipeTransform
{
  public transform (value: { [key: string]: string }): string {
    const result = [];

    Object.keys(value).forEach(index => {
      result.push(this.present(index, value[index]));
    });

    return result.join(', ');
  }

  private present (index: string, src: string): string {
    if (index === '1') {
      return src;
    }

    return `${src} ${index}x`;
  }
}
