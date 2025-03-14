<template>
  <v-toolbar color="primary" dark>
    <v-toolbar-title>Bienvenido de nuevo, {{ user?.name }}</v-toolbar-title>
    <v-btn @click="logout" color="secondary">Cerrar sesión</v-btn>
  </v-toolbar>
  <v-app class="pa-4">
    <v-row justify="space-around" align="center">
      <v-col class="text-center d-flex align-center" cols="6">
        <h1 class="my-10">Catalogo de productos</h1>
        <div v-if="selectedCategory">
          <v-chip color="primary" class="ma-2">{{ selectedCategoryName }}</v-chip>
        </div>
        <div v-if="search">
          <v-chip color="primary" class="ma-2">{{ search }}</v-chip>
        </div>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" class="my-12" @click="showFilterModal = true">Filtrar</v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="showFilterModal" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Filtrar Productos</span>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedCategory"
            :items="categories"
            item-value="uuid"
            item-title="name"
            label="Categoría"
          ></v-select>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Nombre del producto"
            single-line
            hide-details
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelFilter">Borrar</v-btn>
          <v-btn color="blue darken-1" text @click="applyFilter">Aplicar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row class="" justify="space-around">
      <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4" lg="3">
        <Card :product="product" :loading="loading" @add-to-cart="addToCart" />
      </v-col>
    </v-row>
    <v-alert v-model="alert" :type="type" closable class="fixed-alert" @input="alert = false" dismissible>{{ message }}</v-alert>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

interface Product {
  id: number;
  name: string;
  price: number;
  image: {
    url: string;
  };
}

interface Category {
  id: number;
  name: string;
  uuid: string;
}
const store = useUserStore();

export default defineComponent({
  name: 'HomePage',
  data() {
    return {
      loading: false,
      search: '',
      alert: false,
      message: '',
      type: 'error' as 'error' | 'success' | 'info' | 'warning' | undefined,
      showFilterModal: false,
      selectedCategory: null,
    };
  },
  methods: {
    logout() {
      store.logout();
      this.$router.push('login');
    },
    async addToCart(val: { id: any; quantity: any; }) {
      console.log('Adding to cart', val);
      
      this.loading = true;
      try {
        const response = await fetch('https://api.takeit.ciph3r.co/api/v1/carts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${store.user?.token}`,
          },
          body: JSON.stringify({
            product_id: val.id,
            stock: val.quantity,
          }),
        });
        this.loading = false;
        this.message = 'Producto añadido al carrito';
        this.type = 'success';
        this.alert = true;
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        this.loading = false;
        this.message = (error as Error).message;
        this.type = 'error';
        this.alert = true;
      }
    },
    async applyFilter() {
      this.showFilterModal = false;
      await this.getProducts(this.selectedCategory, this.search);
    },
    async cancelFilter() {
      this.showFilterModal = false;
      this.selectedCategory = null;
      this.search = '';
      await this.getProducts();
    },
  },
  setup() {
    const store = useUserStore();
    const router = useRouter();
    const products = ref<Product[]>([]);
    const categories = ref<Category[]>([]);

    const getProducts = async (category = null, search = '') => {
      try {
        const url = new URL('https://api.takeit.ciph3r.co/api/v1/shop');
        url.searchParams.append('per_page', '10');
        url.searchParams.append('page', '1');
        if (category) {
          url.searchParams.append('category_uuid', category);
        }
        if (search) {
          url.searchParams.append('search_key', search);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        products.value = data.data;
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    const getCategories = async () => {
      try {
        const response = await fetch('https://api.takeit.ciph3r.co/api/v1/shop/categories?per_page=0');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        categories.value = data.data;
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    onMounted(async () => {
      if (!store.user) {
        router.push('/login');
      }
      await getProducts();
      await getCategories();
    });

    const selectedCategory = ref(null);
    const selectedCategoryName = computed(() => {
      const category = categories.value.find(cat => cat.uuid === selectedCategory.value);
      return category ? category.name : '';
    });

    const user = store.user;
    return {
      user,
      products,
      categories,
      selectedCategory,
      selectedCategoryName,
      getProducts, // Expose getProducts to be used in applyFilter
    };
  },
});
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}
.fixed-alert {
  position: fixed;
  bottom: 40px;
  right: 0;
  margin: 20px;
}
</style>