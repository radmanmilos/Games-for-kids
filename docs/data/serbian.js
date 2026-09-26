/* Петрин свет — Serbian language data layer (shared)
   Single source of truth for all Serbian Cyrillic vocabulary.
   Games must reference this module instead of re-declaring words inline. */
(function () {
  'use strict';

  const SERBIAN = {
    alphabet: [
      { label: 'А', name: 'а', word: 'Аутомобил' },
      { label: 'Б', name: 'б', word: 'Банана' },
      { label: 'В', name: 'в', word: 'Вук' },
      { label: 'Г', name: 'г', word: 'Гусеница' },
      { label: 'Д', name: 'д', word: 'Дрво' },
      { label: 'Ђ', name: 'ђ', word: 'Ђак' },
      { label: 'Е', name: 'е', word: 'Екран' },
      { label: 'Ж', name: 'ж', word: 'Жаба' },
      { label: 'З', name: 'з', word: 'Звезда' },
      { label: 'И', name: 'и', word: 'Игла' },
      { label: 'Ј', name: 'ј', word: 'Јабука' },
      { label: 'К', name: 'к', word: 'Крава' },
      { label: 'Л', name: 'л', word: 'Лав' },
      { label: 'Љ', name: 'љ', word: 'Љубав' },
      { label: 'М', name: 'м', word: 'Мачка' },
      { label: 'Н', name: 'н', word: 'Нос' },
      { label: 'Њ', name: 'њ', word: 'Њушка' },
      { label: 'О', name: 'о', word: 'Око' },
      { label: 'П', name: 'п', word: 'Пас' },
      { label: 'Р', name: 'р', word: 'Риба' },
      { label: 'С', name: 'с', word: 'Слон' },
      { label: 'Т', name: 'т', word: 'Торта' },
      { label: 'Ћ', name: 'ћ', word: 'Ћуран' },
      { label: 'У', name: 'у', word: 'Уво' },
      { label: 'Ф', name: 'ф', word: 'Фламинго' },
      { label: 'Х', name: 'х', word: 'Хеликоптер' },
      { label: 'Ц', name: 'ц', word: 'Цвет' },
      { label: 'Ч', name: 'ч', word: 'Чамац' },
      { label: 'Џ', name: 'џ', word: 'Џемпер' },
      { label: 'Ш', name: 'ш', word: 'Шешир' },
    ],

    numbers: [
      { label: '0', name: 'нула' },
      { label: '1', name: 'један' },
      { label: '2', name: 'два' },
      { label: '3', name: 'три' },
      { label: '4', name: 'четири' },
      { label: '5', name: 'пет' },
      { label: '6', name: 'шест' },
      { label: '7', name: 'седам' },
      { label: '8', name: 'осам' },
      { label: '9', name: 'девет' },
      { label: '10', name: 'десет' },
    ],

    shapes: [
      'Круг',
      'Квадрат',
      'Троугао',
      'Звезда',
      'Лопта',
      'Коцка',
      'Квадар',
      'Ваљак',
      'Купа',
      'Пирамида',
    ],

    colors: [
      { name: 'Црвена', hex: '#FF4F5E' },
      { name: 'Наранџаста', hex: '#FF8C42' },
      { name: 'Жута', hex: '#FFD23F' },
      { name: 'Зелена', hex: '#67C971' },
      { name: 'Плава', hex: '#4FC3F7' },
      { name: 'Љубичаста', hex: '#9B6DFF' },
      { name: 'Розе', hex: '#FF6F91' },
      { name: 'Браон', hex: '#8B5E3C' },
      { name: 'Сива', hex: '#9AA5B1' },
      { name: 'Бела', hex: '#FFFFFF' },
      { name: 'Црна', hex: '#3A3A3A' },
    ],

    animals: {
      Dog: 'Пас',
      Cat: 'Мачка',
      Cow: 'Крава',
      Lion: 'Лав',
      Elephant: 'Слон',
      Frog: 'Жаба',
      Pig: 'Свиња',
      Duck: 'Патка',
      Fox: 'Лисица',
      Sheep: 'Овца',
      Horse: 'Коњ',
      Chicken: 'Кока',
    },

    praise: [
      'Тачно!',
      'Браво!',
      'Одлично!',
      'Сјајно!',
    ],

    retry: [
      'Хајде поново!',
      'Покушај још једном!',
    ],

    nav: {
      back: 'Назад',
      home: 'Почетна',
      start: 'Крени',
      done: 'Готово',
      next: 'Следеће',
      replay: 'Играј поново',
      parents: 'За родитеље',
    },

    titles: {
      animals: 'Животиње',
      counting: 'Бројеви',
      shapes: 'Облици',
      coloring: 'Бојење',
      tracing: 'Писање',
      classroom: 'Учионица',
      piano: 'Пијано',
      memory: 'Памтилица',
      puzzle: 'Слагалица',
      matching: 'Памтилица',
      racing: 'Трка',
      racing3d: 'Трка 3Д',
      driving: 'Возила',
      ocean: 'Океан',
      dino: 'Дино',
      space: 'Свемир',
      explorer: 'Истраживач',
      candy: 'Сладиш',
    },
  };

  if (typeof window !== 'undefined') window.SERBIAN = SERBIAN;
  if (typeof module !== 'undefined' && module.exports) module.exports = SERBIAN;
})();
