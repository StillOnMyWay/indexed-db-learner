import { LitElement, css, html } from 'lit';
import '@vaadin/button';
import {Notification} from '@vaadin/notification'
import litLogo from './assets/lit.svg';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class MyElement extends LitElement {
  static get properties() {
    return {
      /**
       * Copy for the read the docs hint.
       */
      docsHint: { type: String },

      /**
       * The number of times the button has been clicked.
       */
      count: { type: Number },
    };
  }

  constructor() {
    super();
    this.docsHint = 'Click on the Vite and Lit logos to learn more';
    this.count = 0;
  }

  render() {
    return html`
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <a href="https://lit.dev" target="_blank">
          <img src=${litLogo} class="logo lit" alt="Lit logo" />
        </a>
      </div>
      <slot></slot>
      <div class="card">
        <button @click=${this._onClick} part="button">
          count is ${this.count}
        </button>
      </div>
      <p class="read-the-docs">${this.docsHint}</p>
    `;
  }

  _onClick() {
    let openRequest = indexedDB.open('VeloStore');

    openRequest.onsuccess((e) => {
      console.log('Success: ' + e);
      let db = openRequest.result;
      db.onversionchange = function () {
        db.close();
        alert('Database is outdated, please reload the page.');

        // window.location.reload();
      };

      //Lets do some Indexed DB Stuff!
      let transaction = db.transaction('books', 'readwrite'); // (1)

      // get an object store to operate on it
      let books = transaction.objectStore('books'); // (2)

      let book = {
        id: 'js',
        price: 10,
        created: new Date(),
      };

      let request = books.add(book); // (3)
    });
    openRequest.onupgradeneeded((request, changeevent) => {
      console.warn('Database Schema Upgrade Needed :(');
      console.log('Old Version: ' + changeevent.oldVersion);

      let db = openRequest.result;

      //Create my Object Store (Table). This can only be done in an 'upgrade needed' event.
      !db.objectStoreNames.contains('books') &&
        db.createObjectStore('books', {
          keyPath: 'isbn',
          autoIncrement: false,
        });
    });
    openRequest.onerror = function () {
      console.error('Error', openRequest.error);
    };
    openRequest.onblocked = function () {
      // this event shouldn't trigger if we handle onversionchange correctly
      // it means that there's another open connection to the same database
      // and it wasn't closed after db.onversionchange triggered for it
    };
    console.log('Connection Request Opened');
  }

  async save(){

  }

  async addToStore(){

  }
  static get styles() {
    return css`
      :host {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
      }
      
      .readyDB{
        
      }

      .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
      }
      .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
      }
      .logo.lit:hover {
        filter: drop-shadow(0 0 2em #325cffaa);
      }

      .card {
        padding: 2em;
      }

      .read-the-docs {
        color: #888;
      }

      a {
        font-weight: 500;
        color: #646cff;
        text-decoration: inherit;
      }
      a:hover {
        color: #535bf2;
      }

      h1 {
        font-size: 3.2em;
        line-height: 1.1;
      }

      button {
        border-radius: 8px;
        border: 1px solid transparent;
        padding: 0.6em 1.2em;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        background-color: #1a1a1a;
        cursor: pointer;
        transition: border-color 0.25s;
      }
      button:hover {
        border-color: #646cff;
      }
      button:focus,
      button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
      }

      @media (prefers-color-scheme: light) {
        a:hover {
          color: #747bff;
        }
        button {
          background-color: #f9f9f9;
        }
      }
    `;
  }
}

window.customElements.define('my-element', MyElement);
