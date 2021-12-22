import { Injectable } from '@nestjs/common';
import { type } from 'os';

// Создайте два метода типа PUT, PUTCH, передайте и обработайте эти передаваемые параметры на сервер:
// Header-заголовок, в котором будете передавать тип операции: сложение, вычитание, умножение. Например: Header Type-Operation: “plus”.
// Передайте два оператора, над которыми произведёте операции сложения, вычитания и умножения, через Query, Params, Body.
// Сделайте так, чтобы на выходе метод вернул результат вычисления калькулятора.
// Для создания калькулятора создайте новый модуль со своим контроллером и сервисом.

export type Operation = 'plus' | 'minus' | 'multiplication';

@Injectable()
export class CalculatorService {
  count(operation: Operation, a: number, b: number): number | string {
    switch (operation) {
      case 'plus':
        return a + b;
      break;
      case 'minus':
        return a - b;
      break;
      case 'multiplication':
        return a * b;
      break;
      default:
        return 'Передан не правильный аргумент';
      break;
    }
  }
}
