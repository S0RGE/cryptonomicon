<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add(ticker)"
            type="text"
            name="wallet"
            id="wallet"
            style="text-transform: uppercase"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
          <span
            v-for="coinName in filteredCoinListNames"
            :key="coinName"
            @click="add(coinName)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ coinName }}
          </span>
        </div>
        <div v-if="duplicateCoinError" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button @click="add(ticker)" class="my-4" />
    <!-- :disabled="disabled" -->
  </section>
</template>

<script>
import AddButton from "./AddButton.vue";
import { getAllCoinNames } from "../api.js";

export default {
  components: {
    AddButton,
  },

  props: {
    // disabled: {
    //   type: Boolean,
    //   required: false,
    //   default: false,
    // },
    duplicateCoinError: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ticker: "",
      coinNames: [],
    };
  },

  async mounted() {
    const { Data } = await getAllCoinNames();
    this.coinNames = Object.keys(Data);
  },

  emits: {
    "add-ticker": (value) => typeof value === "string",
  },

  methods: {
    add(ticker) {
      if (ticker.length === 0) {
        return;
      }

      this.$emit("add-ticker", ticker);
      this.ticker = "";
    },
  },

  computed: {
    filteredCoinListNames() {
      return this.coinNames
        .filter((name) =>
          name.toLowerCase().includes(this.ticker.toLowerCase())
        )
        .slice(0, 4);
    },
  },
};
</script>
