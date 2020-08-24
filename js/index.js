// @flow
import $ from 'jquery';

import * as calculator from './calculator';
import type { Data } from './typedefs';
// eslint-disable-next-line import/no-unresolved, import/extensions
import './jqueryplugins';

// Browser globals
const { scrollTo, sessionStorage } = window;

let nRows = 1; // Number of rows.
const MAX_DECK_SIZE = 1000; // Maximum deck size to process.

/**
 * Get all form data as an object.
 */
function getData(): Data {
  const data = {};
  data.deckSize = parseInt($('#deckSize').val(), 10);
  data.handSize = parseInt($('#handSize').val(), 10);
  data.cards = [];

  for (let i = 0; i < nRows; i += 1) {
    const name = $(`#name${i}`).val();
    const numInDeck = $(`#aid${i}`).val();
    const numRequired = $(`#ar${i}`).val();

    data.cards.push({
      name,
      numInDeck: parseInt(numInDeck, 10),
      numRequired: parseInt(numRequired, 10),
    });
  }

  return data;
}

/**
 * Handle an error.
 */
function handle(e: string): void {
  $('#results').html(`<div class="alert alert-danger">${e}</div>`);
}

/**
 * Add a row.
 */
function addRow(): void {
  const row = nRows;

  $(`#card${row}`).html(`<td><input type="text" id="name${row}" placeholder="Card Name" class="form-control"/></td>
    <td><input type="number" id="aid${row}" class="form-control num"/></td>
    <td><input type="number" id="ar${row}" class="form-control num"/></td>`);

  // Session storage logic
  $(`#name${row}`).val(sessionStorage.getItem(`#name${row}`) || '').change(function setName() {
    sessionStorage.setItem(`#name${row}`, $(this).val());
  });
  $(`#aid${row}`).val(sessionStorage.getItem(`id${row}`) || 1).change(function setId() {
    sessionStorage.setItem(`id${row}`, $(this).val());
  });
  $(`#ar${row}`).val(sessionStorage.getItem(`req${row}`) || 1).change(function setReq() {
    sessionStorage.setItem(`req${row}`, $(this).val());
  });

  $('#tab_logic').append(`<tr id="card${row + 1}"></tr>`);
  nRows += 1;
}

/**
 * Delete a row.
 */
function deleteRow(): void {
  if (nRows > 1) {
    $(`#card${nRows - 1}`).html('');
    nRows -= 1;
  }
}

/**
 * Set form data.
 */
function setData(data: Data): void {
  const numCards = data.cards.length || 1;

  // Add / remove rows
  while (nRows < numCards) {
    addRow();
  }
  while (nRows > numCards) {
    deleteRow();
  }

  // Modify rows
  for (let i = 0; i < numCards; i += 1) {
    $(`#name${i}`).val(data.cards[i].name);
    $(`#aid${i}`).val(data.cards[i].numInDeck);
    $(`#ar${i}`).val(data.cards[i].numRequired);

    // Session storage logic
    sessionStorage.setItem(`#name${i}`, data.cards[i].name);
    sessionStorage.setItem(`#id${i}`, data.cards[i].numInDeck);
    sessionStorage.setItem(`#req${i}`, data.cards[i].numRequired);
  }

  // Modify form data
  $('#deckSize').val(data.deckSize);
  $('#handSize').val(data.handSize);

  sessionStorage.setItem('rows', numCards);
  $('#primaryForm').submit();
}

/**
 * Initialize (once DOM is ready).
 */
function init(): void {
  // Collapse
  $('.collapse').collapse();

  // Tooltips
  $('[data-toggle="tooltip"]').tooltip();

  // Table
  for (let i = 1; i < sessionStorage.getItem('rows') || 0; i += 1) {
    addRow();
  }
  $('#add_row').click(() => {
    addRow();
    sessionStorage.setItem('rows', nRows);
  });
  $('#delete_row').click(() => {
    deleteRow();
    sessionStorage.setItem('rows', nRows);
  });

  // Form
  $('#primaryForm').submit((event) => {
    event.preventDefault();

    const data = getData();

    // Validation
    if (data.handSize > data.deckSize) {
      handle('Your hand size is bigger than your deck size.');
    } else if (data.deckSize < calculator.getSumInDeck(data)) {
      handle('Your deck size is too small, check your "Amount in Deck" values.');
    } else if (data.handSize < calculator.getSumRequired(data)) {
      handle('Your hand size is too small for this combo.');
    } else if ([...document.getElementsByClassName('num')].some((elem) => elem instanceof HTMLInputElement && elem.value === '')) {
      handle('Check your "Amount in Deck" and "Amount Required" values. One of them is not a number.');
    } else if (data.deckSize > MAX_DECK_SIZE) {
      handle(`If your deck has ${data.deckSize} cards, I wouldn't suggest playing combo.`);
    } else {
      try {
        const obj = calculator.getChance(data);
        const jq = $('#results');

        jq.empty()
          .append('Combo: ')
          .append(data.cards.map((card) => `${card.numRequired}x ${card.name || 'Unnamed Card'}`).join(', '))
          .append(`<br>Deck Size: ${data.deckSize}, Cards in Hand: ${data.handSize}`)
          .append(`<br><br>The chance of you pulling this off is ${obj.experimental ? '<a href="#" data-toggle="modal" data-target="#approximately">approximately</a> ' : ''}`)
          .append(`${Number(obj.percent).toPrecision(3)}%.`);
      } catch (e) {
        handle(e);
      } finally {
        if (document.body != null) {
          scrollTo(0, document.body.scrollHeight);
        }
      }
    }
  });
  $('#clear').click(() => {
    $('input').each((index, elem) => {
      const $elem = elem;
      if (/^(aid|ar).*$/.test($elem.id)) {
        $elem.value = 1;
      } else {
        $elem.value = '';
      }
      while (nRows > 1) {
        deleteRow();
      }
      sessionStorage.clear();
    });
    const resultsContainer = document.getElementById('results');
    if (resultsContainer != null) {
      resultsContainer.innerHTML = '';
    }
  });

  // Examples
  $('#exodia').click((event) => {
    event.preventDefault();
    setData({
      deckSize: 40,
      handSize: 5,
      cards: [{
        name: 'Exodia the Forbidden One',
        numInDeck: 1,
        numRequired: 1,
      }, {
        name: 'Right Leg of the Forbidden One',
        numInDeck: 1,
        numRequired: 1,
      }, {
        name: 'Left Leg of the Forbidden One',
        numInDeck: 1,
        numRequired: 1,
      }, {
        name: 'Right Arm of the Forbidden One',
        numInDeck: 1,
        numRequired: 1,
      }, {
        name: 'Left Arm of the Forbidden One',
        numInDeck: 1,
        numRequired: 1,
      }],
    });
  });
  $('#channelFireball').click((event) => {
    event.preventDefault();
    setData({
      deckSize: 60,
      handSize: 7,
      cards: [{
        name: 'Black Lotus',
        numInDeck: 1,
        numRequired: 1,
      }, {
        name: 'Channel',
        numInDeck: 1,
        numRequired: 1,
      }, {
        name: 'Fireball',
        numInDeck: 4,
        numRequired: 1,
      }, {
        name: 'Mountain',
        numInDeck: 24,
        numRequired: 1,
      }],
    });
  });
  $('#leyline').click((event) => {
    event.preventDefault();
    setData({
      deckSize: 60,
      handSize: 7,
      cards: [{
        name: 'Leyline of Sanctity',
        numInDeck: 4,
        numRequired: 1,
      }],
    });
  });
  $('#birdsOfParadise').click((event) => {
    event.preventDefault();
    setData({
      deckSize: 60,
      handSize: 7,
      cards: [{
        name: 'Birds of Paradise',
        numInDeck: 4,
        numRequired: 1,
      }, {
        name: 'Forest',
        numInDeck: 24,
        numRequired: 1,
      }],
    });
  });
}

$(init);
