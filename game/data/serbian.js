/* Петрин свет — shared stable Serbian vocabulary.
   Keep genuinely game-specific wording with its game. */
(function () {
  'use strict';

  const SERBIAN = {
    alphabet: [
      { label: 'А', name: 'а', word: 'Аутомобил', emoji: '🚗' },
      { label: 'Б', name: 'б', word: 'Банана', emoji: '🍌' },
      { label: 'В', name: 'в', word: 'Вук', emoji: '🐺' },
      { label: 'Г', name: 'г', word: 'Гусеница', emoji: '🐛' },
      { label: 'Д', name: 'д', word: 'Дрво', emoji: '🌳' },
      { label: 'Ђ', name: 'ђ', word: 'Ђак', emoji: '🧑‍🎓' },
      { label: 'Е', name: 'е', word: 'Екран', emoji: '🖥️' },
      { label: 'Ж', name: 'ж', word: 'Жаба', emoji: '🐸' },
      { label: 'З', name: 'з', word: 'Звезда', emoji: '⭐' },
      { label: 'И', name: 'и', word: 'Игла', emoji: '🪡' },
      { label: 'Ј', name: 'ј', word: 'Јабука', emoji: '🍎' },
      { label: 'К', name: 'к', word: 'Крава', emoji: '🐮' },
      { label: 'Л', name: 'л', word: 'Лав', emoji: '🦁' },
      { label: 'Љ', name: 'љ', word: 'Љубав', emoji: '❤️' },
      { label: 'М', name: 'м', word: 'Мачка', emoji: '🐱' },
      { label: 'Н', name: 'н', word: 'Нос', emoji: '👃' },
      { label: 'Њ', name: 'њ', word: 'Њушка', emoji: '🐽' },
      { label: 'О', name: 'о', word: 'Око', emoji: '👁️' },
      { label: 'П', name: 'п', word: 'Пас', emoji: '🐶' },
      { label: 'Р', name: 'р', word: 'Риба', emoji: '🐟' },
      { label: 'С', name: 'с', word: 'Слон', emoji: '🐘' },
      { label: 'Т', name: 'т', word: 'Торта', emoji: '🎂' },
      { label: 'Ћ', name: 'ћ', word: 'Ћуран', emoji: '🦃' },
      { label: 'У', name: 'у', word: 'Уво', emoji: '👂' },
      { label: 'Ф', name: 'ф', word: 'Фламинго', emoji: '🦩' },
      { label: 'Х', name: 'х', word: 'Хеликоптер', emoji: '🚁' },
      { label: 'Ц', name: 'ц', word: 'Цвет', emoji: '🌼' },
      { label: 'Ч', name: 'ч', word: 'Чамац', emoji: '⛵' },
      { label: 'Џ', name: 'џ', word: 'Џемпер', emoji: '🧥' },
      { label: 'Ш', name: 'ш', word: 'Шешир', emoji: '🎩' },
    ],

    numbers: [
      { label: '0', name: 'нула', sentence: 'Нула', emoji: '', count: 0 },
      { label: '1', name: 'један', sentence: 'Један пас', emoji: '🐶', count: 1 },
      { label: '2', name: 'два', sentence: 'Два пса', emoji: '🐶', count: 2 },
      { label: '3', name: 'три', sentence: 'Три мачке', emoji: '🐱', count: 3 },
      { label: '4', name: 'четири', sentence: 'Четири краве', emoji: '🐮', count: 4 },
      { label: '5', name: 'пет', sentence: 'Пет слонова', emoji: '🐘', count: 5 },
      { label: '6', name: 'шест', sentence: 'Шест лавова', emoji: '🦁', count: 6 },
      { label: '7', name: 'седам', sentence: 'Седам патака', emoji: '🦆', count: 7 },
      { label: '8', name: 'осам', sentence: 'Осам коња', emoji: '🐴', count: 8 },
      { label: '9', name: 'девет', sentence: 'Девет жаба', emoji: '🐸', count: 9 },
      { label: '10', name: 'десет', sentence: 'Десет свиња', emoji: '🐷', count: 10 },
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

    classroom: {
      activities: {
        alphabet: 'Азбука',
        numbers: 'Бројеви',
        shapes: 'Облици',
        colors: 'Боје',
      },
      kidsTitles: {
        alphabet: 'Азбука за децу',
        numbers: 'Бројеви за децу',
        colors: 'Боје за децу',
        shapes: 'Облици за децу',
      },
      questions: {
        alphabet: 'Које је ово слово?',
        numbers: 'Колико има?',
        colors: 'Која је ово боја?',
        shapes: 'Који је ово облик?',
      },
      correct: 'Тачно!',
    },

    tracing: {
      activities: {
        prewriting: 'Прво цртање',
        letters: 'Слова',
        numbers: 'Бројеви',
        shapes: 'Облици',
      },
      prewriting: [
        'Водоравна линија',
        'Усправна линија',
        'Круг',
        'Лук',
        'Зигзаг',
        'Талас',
        'Квадрат',
        'Троугао',
      ],
    },

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

    reactions: {
      ouch: 'Јао!',
      ouchPlain: 'Јао',
    },

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
      animal_counting: 'Бројање',
      animal_memory: 'Памтилица',
      animal_puzzle: 'Слагалице',
      classroom: 'Учионица',
      compare: 'Више или мање',
      sorting: 'Разврставање',
      phonics: 'Слова и звуци',
      sequencing: 'Редослед',
      rhythm: 'Ритам',
      spatial: 'Простор',
      coloring: 'Бојење',
      tracing: 'Писање',
      piano: 'Клавир',
      shapes: 'Облици',
      matching_game: 'Слагалица бомбона',
      driving: 'Возила',
      ocean: 'Океан',
      dino: 'Дино',
      space: 'Свемир',
      racing3d: 'Мала тркачица 3Д',
      explorer: 'Мала истраживачица',
      parent: 'За родитеље',
    },
  };

  if (typeof window !== 'undefined') window.SERBIAN = SERBIAN;
  if (typeof module !== 'undefined' && module.exports) module.exports = SERBIAN;
})();
