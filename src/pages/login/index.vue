<template lang="">
  <v-container class="d-flex justify-center align-center fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="pa-5" max-width="400">
          <v-card-title class="text-h5">Login</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Contraseña"
                type="password"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="$router.push('/register')" :disabled="loading">Registrarse</v-btn>
            <v-btn color="primary" @click="login" :loading="loading">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-model="alert" type="error" closable class="fixed-alert" @input="error = false" dismissible>{{ message }}</v-alert>
  </v-container>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/userStore';

interface FormData {
  valid: boolean;
  email: string;
  password: string;
  alert: boolean;
  message: string;
  loading: boolean;
  emailRules: ((v: string) => boolean | string)[];
  passwordRules: ((v: string) => boolean | string)[];
}

interface FormRef {
  validate: () => boolean;
}

export default {
  data(): FormData {
    return {
      valid: false,
      email: '',
      password: '',
      alert: false,
      message: '',
      loading: false,
      emailRules: [
        (v: any) => !!v || 'Email es requerido',
        (v: string) => /.+@.+\..+/.test(v) || 'Email debe ser válido',
      ],
      passwordRules: [
        (v: any) => !!v || 'Contraseña es requerido'
      ],
    };
  },
  methods: {
    async login(): Promise<void> {
      const form = this.$refs.form as FormRef;
      const isValid = await form.validate();
      const store = useUserStore();
      if (isValid.valid) {
        this.loading = true;
        try {
          // Replace with your login API call
          const response = await fetch('https://api.takeit.ciph3r.co/api/v1/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }
          this.loading = false;
          const data = await response.json();
          store.setUser(data.data);
          this.$router.push('/');
          // Handle successful login (e.g., store token, redirect)
          console.log('Login successful', data);
        } catch (error) {
          this.alert = true;
          this.message = (error as Error).message;
          this.loading = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
.fixed-alert {
  position: fixed;
  bottom: 40px;
  right: 0;
  margin: 20px;
}
</style>