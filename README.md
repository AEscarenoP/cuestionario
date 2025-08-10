# 💕 Cuestionario Romántico

Un cuestionario especial con Astro + Vue + Supabase donde el botón "NO" se escapa cuando intentan rechazar tu invitación.

## 🚀 Configuración rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
Ve a tu panel de Supabase y ejecuta el SQL en `database/schema.sql`

### 3. Ejecutar el proyecto
```bash
npm run dev
```

## 📁 Estructura del proyecto
```
src/
├── components/
│   ├── Stepper.vue          # Indicador de progreso
│   ├── QuestionCard.vue     # Componente de pregunta reutilizable
│   └── Questionnaire.vue    # Componente principal del cuestionario
├── lib/
│   └── supabase.ts         # Cliente de Supabase y tipos
└── pages/
    └── index.astro         # Página principal
```

## 🔧 Configurar VS Code

### Extensiones requeridas:
1. **Astro** (astro-build.astro-vscode)
2. **Vue Language Features (Volar)** (Vue.volar)

### Pasos:
1. Abre VS Code
2. Ve a Extensions (Ctrl+Shift+X)
3. Instala las extensiones mencionadas
4. Reinicia VS Code
5. Abre la carpeta del proyecto desde File > Open Folder

## ✨ Características

- 📱 **Responsive design** - Funciona en móvil y desktop
- 🎯 **Stepper visual** - Muestra progreso del cuestionario
- 🎭 **Pregunta especial** - El botón "NO" se mueve cuando intentan clickearlo
- 💾 **Base de datos** - Guarda respuestas en Supabase
- 🔄 **Componentes modulares** - Código reutilizable y limpio

## 🎨 Personalización

Puedes personalizar las preguntas directamente en Supabase o editando el archivo `database/schema.sql`