<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <add-ticker @add-ticker="add" :duplicateCoinError="duplicateCoinError" />
      <!-- :disabled="tooManyTickers" -->
      <crypto-button @click="page = page - 1" v-if="page > 1">
        Назад
      </crypto-button>
      <crypto-button @click="page = page + 1" v-if="hasNextPage">
        Вперед
      </crypto-button>
      <hr />
      <input v-model="filter" type="text" placeholder="Фильтр" />
      <crypto-coins
        @select-ticker="select"
        @delete-ticker="handleDelete"
        :paginatedTickers="paginatedTickers"
        :selectedTicker="selectedTicker"
      />
      <!-- v-if="tickers.length" -->
      <crypto-graph
        v-if="selectedTicker"
        :graph="graph"
        :name="selectedTicker?.name"
        @closeGraphView="closeGraphView"
      />
    </div>
  </div>
</template>

<script>
import {
  subscribeToTicker,
  unsubscribeFromTicker,
  closeWSConnection,
} from "./api";
import AddTicker from "@/components/AddTicker.vue";
import CryptoGraph from "@/components/CryptoGraph.vue";
import CryptoCoins from "@/components/CryptoCoins.vue";
import CryptoButton from "@/components/CryptoButton.vue";

export default {
  name: "App",
  data() {
    return {
      tickers: [],
      selectedTicker: null,
      apiKey: "",
      graph: [],
      filter: "",
      page: 1,
      duplicateCoinError: false,
      coinsPerPage: 6,
    };
  },
  components: { AddTicker, CryptoGraph, CryptoCoins, CryptoButton },

  computed: {
    // tooManyTickers() {
    //  return this.tickers.length > 10;
    // },
    startIndex() {
      return (this.page - 1) * this.coinsPerPage;
    },

    endIndex() {
      return this.page * this.coinsPerPage;
    },
    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    const VALID_KEYS = ["filter", "page"];
    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    const tickerData = localStorage.getItem("crypto-list");

    // subscribeToTicker(currentTicker.name, (newPrice) =>
    //     this.updateTicker(currentTicker.name, newPrice)
    //   );

    if (tickerData) {
      this.tickers = JSON.parse(tickerData);
      this.tickers.forEach((ticker) => {
        console.log(ticker.name);
        subscribeToTicker(ticker.name, (newPrice) =>
          this.updateTicker(ticker.name, newPrice)
        );
      });
    }
  },

  beforeUnmount() {
    closeWSConnection();
  },

  methods: {
    closeGraphView() {
      this.selectedTicker = null;
    },
    updateTicker(tickerName, price) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          if (t === this.selectedTicker) {
            this.graph.push(price);
          }
          t.price = price;
        });
    },

    showError() {
      this.duplicateCoinError = true;
      setTimeout(() => {
        this.duplicateCoinError = false;
      }, 5000);
      return;
    },
    add(ticker) {
      if (
        this.tickers.find(
          (el) => el.name.toUpperCase() === ticker.toUpperCase()
        )
      ) {
        this.showError();
      }

      const currentTicker = { name: ticker.toUpperCase(), price: "-" };
      this.tickers = [...this.tickers, currentTicker];

      this.filter = "";
      subscribeToTicker(currentTicker.name, (newPrice) =>
        this.updateTicker(currentTicker.name, newPrice)
      );
    },
    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((el) => el != tickerToRemove);

      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove.name);
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },
  },

  watch: {
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    tickers() {
      localStorage.setItem("crypto-list", JSON.stringify(this.tickers));
    },

    selectedTicker() {
      this.graph = [];
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>
