import { LitElement, css, html } from "lit";
import "@vaadin/button";
import "@vaadin/text-area";
import '@vaadin/item';
import '@vaadin/list-box';


import { Notification } from "@vaadin/notification";
import litLogo from "./assets/lit.svg";

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
      isDBReady: { type: Boolean },
      /**
       * @type {Array}
       */
      bookList: { type: Array }
    };
  }

  constructor() {
    super();
    this.docsHint = "Click on the Vite and Lit logos to learn more";
    this.count = 0;
    this.isDBReady = false;
    this.db = null;
    this.bookList = [];
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
          Database is <span class="${this.isDBReady ? "dbReady" : "dbNotReady"
      }">${this.isDBReady ? "ready" : "not ready yet"}.</span>
        </button>
      </div>
      <div class="card">
        <vaadin-button @click=${this.saveToDB} part="button">
          Save Item To DB
        </button>
      </div>
      <vaadin-list-box selected="2">
      ${this.bookList.map(item => { return html`<vaadin-item>${item.isbn} - ${item.title}</vaadin-item>` })}
      </vaadin-list-box>
  `;
  }

  _onClick() {
    let openRequest = indexedDB.open("VeloStore");

    openRequest.onsuccess = (e) => {
      console.log("Success: " + e);
      this.db = openRequest.result;
      this.db.onversionchange = function () {
        this.db.close();
        Notification.show("Database is outdated, please reload the page.", { theme: "error", position: 'top-end' })
      };

      this.isDBReady = true;
    };
    openRequest.onupgradeneeded = (changeevent) => {
      console.warn("Database Schema Upgrade Needed :(");
      console.log("Old Version: " + changeevent.oldVersion);

      this.db = openRequest.result;

      //Create my Object Store (Table). This can only be done in an 'upgrade needed' event.
      !this.db.objectStoreNames.contains("books") &&
        this.db.createObjectStore("books", {
          keyPath: "isbn",
          autoIncrement: true,
        });
    };
    openRequest.onerror = function () {
      console.error("Error", openRequest.error);
      Notification.show("Error has occurred in opening the database >> Full Error in console");
    };
    openRequest.onblocked = function () {
      // this event shouldn't trigger if we handle onversionchange correctly
      // it means that there's another open connection to the same database
      // and it wasn't closed after db.onversionchange triggered for it
    };
    console.log("Connection Request Opened");
  }

  async saveToDB() {
    //Lets do some Indexed DB Stuff!
    let transaction = this.db.transaction("books", "readwrite"); // (1)

    // get an object store to operate on it
    let books = transaction.objectStore("books"); // (2)

    console.time('AddToStore')
    this.addToStore(books);

    transaction.oncomplete = function () {
      console.log("Transaction is complete");
      Notification.show("Transaction is complete", { position: "bottom-center" })
      console.timeEnd("AddToStore");
    }

    //Use already opened transaction
    this.getAllItemsFromStore(books)
  }

  /**
   * 
   * @param {IDBObjectStore} objectStore 
   * @param {Object} data 
   */
  addToStore(objectStore, data) {
    let book = {
      // isbn: 10,
      title: "Charles Brown Bio",
      price: Math.floor(Math.random() * 100),
      created: new Date(),
    };

    let request = objectStore.add(book); // (3)

    request.onsuccess = () => {
      console.info(request.result);
      Notification.show(`Successfully Added New Book with an ID - ${request.result} `, { duration: 2400, theme: 'success', position: 'bottom-end' })
    }

    request.onerror = event => {
      console.error(request.error);
      Notification.show(`We have an error with the request - ${request.error} `, { duration: 2400, theme: 'error', position: 'bottom-end' })
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * 
   * @param {IDBObjectStore} store 
   */
  async getAllItemsFromStore(store) {

    const request = store.getAll();

    request.onsuccess = e =>{
      console.log("Successfully added");
      this.bookList = request.result;
      console.log(this.bookList);
      this.requestUpdate();
    }
  }

  static get styles() {
    return css`
      :host {
  max - width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text - align: center;
}

      .dbReady {
  color: green;
}
      .dbReady::after {
  content: "🙌🏽";
}
      .dbNotReady {
  color: red;
}
      .logo {
  height: 6em;
  padding: 1.5em;
  will - change: filter;
}
      .logo:hover {
  filter: drop - shadow(0 0 2em #646cffaa);
}
      .logo.lit:hover {
  filter: drop - shadow(0 0 2em #325cffaa);
}

      .card {
  padding: 2em;
}

      .read - the - docs {
  color: #888;
}

      a {
  font - weight: 500;
  color: #646cff;
  text - decoration: inherit;
}
a:hover {
  color: #535bf2;
}

      h1 {
  font - size: 3.2em;
  line - height: 1.1;
}

      button {
  border - radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font - size: 1em;
  font - weight: 500;
  font - family: inherit;
  background - color: #1a1a1a;
  cursor: pointer;
  transition: border - color 0.25s;
}
button:hover {
  border - color: #646cff;
}
button: focus,
  button: focus - visible {
  outline: 4px auto - webkit - focus - ring - color;
}

@media(prefers - color - scheme: light) {
  a:hover {
    color: #747bff;
  }
        button {
    background - color: #f9f9f9;
  }
}
`;
  }
}

window.customElements.define("my-element", MyElement);
