<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="10">
        <v-card class="pa-5" max-width="500">
          <v-card-title class="text-h5">Registro</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="username"
                :rules="usernameRules"
                label="Nombre"
                required
              ></v-text-field>
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
              <v-text-field
                v-model="c_password"
                :rules="passwordRules"
                label="Confirmar Contraseña"
                type="password"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="$router.push('/login')" :disabled="loading">Volver</v-btn>
            <v-btn color="primary" @click="register" :loading="loading">Registrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-model="alert" :type="type" closable class="fixed-alert" @input="alert = false" dismissible>{{ message }}</v-alert>
  </v-container>
</template>

<script lang="ts">
  
interface FormData {
  valid: boolean;
  username: string;
  email: string;
  password: string;
  c_password: string;
  alert: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | undefined;
  loading: boolean;
  usernameRules: ((v: string) => boolean | string)[];
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
      username: '',
      email: '',
      password: '',
      c_password: '',
      alert: false,
      message: '',
      type: 'success',
      loading: false,
      usernameRules: [
        (v: string) => !!v || 'Nombre es requerido',
        (v: string) => (v && v.length >= 3) || 'Nombre de usuario debe tener al menos 3 caracteres',
      ],
      emailRules: [
        (v: string) => !!v || 'Email es requerido',
        (v: string) => /.+@.+\..+/.test(v) || 'Email debe ser válido',
      ],
      passwordRules: [
        (v: string) => !!v || 'Contraseña es requerido',
        (v: string) => (v && v.length >= 6) || 'Contraseña debe tener al menos 6 caracteres',
      ],
    };
  },
  methods: {
    async register(): Promise<void> {
      const form = this.$refs.form as FormRef;
      const isValid = await form.validate();
      if (isValid.valid) {
        this.loading = true; 
        try {
          const response = await fetch('https://api.takeit.ciph3r.co/api/v1/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: this.username,
              email: this.email,
              password: this.password,
              c_password: this.c_password
            }),
          });

          if (!response.ok) {
            throw new Error('Registration failed');
          }
          this.alert = true;
          this.type = 'success';
          this.message = 'Registro exitoso';
          this.loading = false;
          setTimeout(() => {
            this.$router.push('/login');
          }, 1000);
        } catch (error) {
          this.alert = true;
          this.type = 'error';
          this.message = (error as Error).message;
          this.loading = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.v-container {
  max-width: 600px;
  margin: 0 auto;
}
.fixed-alert {
  position: fixed;
  bottom: 40px;
  right: 0;
  margin: 20px;
}
</style>