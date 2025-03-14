<template>
  <v-card color="white" light>
    <v-img :src="product?.image?.url || ''" height="200px"></v-img>
    <v-card-title>{{ product.name }}</v-card-title>
    <v-card-subtitle>{{ formatCurrency(product.price) }}</v-card-subtitle>
    <v-card-text>
      <v-text-field
        v-model="quantity"
        label="Cantidad"
        type="number"
        min="1"
      ></v-text-field>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn color="primary" :loading="loading" @click="addToCart">Añadir al carrito</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      quantity: 1
    };
  },
  methods: {
    addToCart() {
      this.$emit('add-to-cart', { id: this.product.id, quantity: this.quantity });
    },
    formatCurrency(value: number) {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
    },
  }
};
</script>

<style scoped>
.v-card {
  max-width: 400px;
  margin: 20px;
}
</style>