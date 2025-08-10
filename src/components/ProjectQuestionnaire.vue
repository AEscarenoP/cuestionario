<template>
  <div class="questionnaire">
    <div class="container">
      <div class="header">
        <h1>Formulario de Evaluación de Proyecto</h1>
        <p>Por favor responde las siguientes preguntas sobre tu proyecto</p>
      </div>
      
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="progress-text">{{ currentStep + 1 }} de {{ questions.length }} preguntas</div>
      
      <div v-if="!isCompleted" class="question-card">
        <h2>{{ currentQuestion.text }}</h2>
        
        <!-- Text Input -->
        <div v-if="currentQuestion.type === 'text'" class="input-group">
          <input
            type="text"
            v-model="currentAnswer"
            :placeholder="currentQuestion.placeholder"
            class="text-input"
          />
        </div>

        <!-- Multiple Choice -->
        <div v-else-if="currentQuestion.type === 'multiple_choice'" class="input-group">
          <div 
            v-for="option in currentQuestion.options" 
            :key="option"
            class="option"
            :class="{ 'selected': currentAnswer === option }"
            @click="currentAnswer = option"
          >
            <div class="option-circle">
              <div v-if="currentAnswer === option" class="option-dot"></div>
            </div>
            <span>{{ option }}</span>
          </div>
        </div>

        <!-- Scale -->
        <div v-else-if="currentQuestion.type === 'scale'" class="input-group">
          <div class="scale-container">
            <div class="scale-labels">
              <span>{{ currentQuestion.scaleLabels[0] }}</span>
              <span>{{ currentQuestion.scaleLabels[1] }}</span>
            </div>
            <div class="scale-buttons">
              <button
                v-for="n in 5"
                :key="n"
                class="scale-btn"
                :class="{ 'selected': currentAnswer === n.toString() }"
                @click="currentAnswer = n.toString()"
              >
                {{ n }}
              </button>
            </div>
          </div>
        </div>

        <!-- Yes/No -->
        <div v-else-if="currentQuestion.type === 'yes_no'" class="input-group">
          <div class="yes-no-buttons">
            <button
              class="btn btn-yes"
              :class="{ 'selected': currentAnswer === 'SI' }"
              @click="currentAnswer = 'SI'"
            >
              Sí
            </button>
            <button
              class="btn btn-no"
              :class="{ 'selected': currentAnswer === 'NO' }"
              @click="currentAnswer = 'NO'"
            >
              No
            </button>
          </div>
        </div>

        <!-- Special Question -->
        <div v-else-if="currentQuestion.type === 'special'" class="input-group">
          <div class="special-buttons">
            <button
              class="btn btn-yes btn-special"
              @click="currentAnswer = 'SI'"
            >
              ¡Sí! 💕
            </button>
            <button
              ref="noButton"
              class="btn btn-no btn-special moving-no"
              :style="noButtonStyle"
              @click="moveNoButton"
              @mouseenter="moveNoButton"
            >
              No
            </button>
          </div>
        </div>
      </div>

      <!-- Success Screen -->
      <div v-else class="completion-screen">
        <div class="completion-card">
          <div v-if="finalAnswer === 'SI'" class="romantic-success">
            <h2>¡Qué emoción! 🎉</h2>
            <p>¡Me hace muy feliz tu respuesta! Pronto te contactaré para planear nuestra cita. 💕</p>
          </div>
          <div v-else class="project-complete">
            <h2>¡Formulario Completado! ✅</h2>
            <p>Gracias por completar la evaluación de tu proyecto.</p>
          </div>
          <button @click="restartForm" class="btn btn-primary">
            Empezar de nuevo
          </button>
        </div>
      </div>
      
      <div v-if="!isCompleted" class="navigation">
        <button
          v-if="currentStep > 0"
          @click="previousQuestion"
          class="btn btn-secondary"
        >
          ← Anterior
        </button>
        
        <button
          v-if="canContinue && currentStep < questions.length - 1"
          @click="nextQuestion"
          class="btn btn-primary"
        >
          Siguiente →
        </button>
        
        <button
          v-if="canContinue && currentStep === questions.length - 1"
          @click="completeForm"
          class="btn btn-success"
        >
          Finalizar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Question {
  text: string
  type: 'text' | 'multiple_choice' | 'scale' | 'yes_no' | 'special'
  placeholder?: string
  options?: string[]
  scaleLabels?: [string, string]
}

const questions: Question[] = [
  {
    text: "¿Cuál es el nombre de tu proyecto?",
    type: "text",
    placeholder: "Ej: Sistema de Gestión de Inventario"
  },
  {
    text: "¿En qué tecnología está basado principalmente tu proyecto?",
    type: "multiple_choice",
    options: ["JavaScript/Node.js", "Python/Django", "Java/Spring", "C#/.NET", "PHP/Laravel", "React/Vue", "Otro"]
  },
  {
    text: "¿Cuál es el objetivo principal de tu proyecto?",
    type: "multiple_choice",
    options: ["Automatizar procesos", "Mejorar la experiencia del usuario", "Reducir costos", "Aumentar ventas", "Gestión de datos", "Comunicación interna"]
  },
  {
    text: "¿Cuántas personas trabajan en el equipo de desarrollo?",
    type: "multiple_choice",
    options: ["Solo yo", "2-3 personas", "4-6 personas", "7-10 personas", "Más de 10 personas"]
  },
  {
    text: "¿En qué fase se encuentra actualmente el proyecto?",
    type: "multiple_choice",
    options: ["Planificación", "Desarrollo inicial", "Desarrollo avanzado", "Pruebas", "Implementación", "Mantenimiento"]
  },
  {
    text: "Del 1 al 5, ¿qué tan satisfecho estás con el progreso del proyecto?",
    type: "scale",
    scaleLabels: ["Muy insatisfecho", "Muy satisfecho"]
  },
  {
    text: "¿El proyecto tiene un presupuesto definido?",
    type: "yes_no"
  },
  {
    text: "¿Cuál es el mayor desafío que has enfrentado en este proyecto?",
    type: "text",
    placeholder: "Describe brevemente el principal desafío..."
  },
  {
    text: "Del 1 al 5, ¿qué tan probable es que recomiendes este tipo de proyecto a otros?",
    type: "scale",
    scaleLabels: ["Nada probable", "Muy probable"]
  },
  {
    text: "¿Quieres salir conmigo? 💕",
    type: "special"
  }
]

const currentStep = ref(0)
const answers = ref<Record<number, string>>({})
const currentAnswer = ref('')
const isCompleted = ref(false)
const finalAnswer = ref('')
const noButton = ref<HTMLElement>()
const noButtonPosition = ref({ x: 0, y: 0 })

const currentQuestion = computed(() => questions[currentStep.value])
const progressPercentage = computed(() => ((currentStep.value + 1) / questions.length) * 100)
const canContinue = computed(() => currentAnswer.value.trim() !== '')

const noButtonStyle = computed(() => ({
  transform: `translate(${noButtonPosition.value.x}px, ${noButtonPosition.value.y}px)`,
  transition: 'transform 0.3s ease-out'
}))

function nextQuestion() {
  answers.value[currentStep.value] = currentAnswer.value
  currentStep.value++
  currentAnswer.value = answers.value[currentStep.value] || ''
}

function previousQuestion() {
  currentStep.value--
  currentAnswer.value = answers.value[currentStep.value] || ''
}

function completeForm() {
  answers.value[currentStep.value] = currentAnswer.value
  finalAnswer.value = currentAnswer.value
  isCompleted.value = true
}

function restartForm() {
  currentStep.value = 0
  answers.value = {}
  currentAnswer.value = ''
  isCompleted.value = false
  finalAnswer.value = ''
  noButtonPosition.value = { x: 0, y: 0 }
}

function moveNoButton() {
  if (currentQuestion.value.type !== 'special') return
  
  const maxMove = 100
  noButtonPosition.value = {
    x: Math.random() * maxMove - maxMove / 2,
    y: Math.random() * 60 - 30
  }
}
</script>

<style scoped>
.questionnaire {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 2rem 0;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: white;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: white;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.question-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
}

.question-card h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.input-group {
  margin-top: 1rem;
}

.text-input {
  width: 100%;
  padding: 1rem 1.2rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  outline: none;
}

.text-input:focus {
  border-color: #f093fb;
  box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
}

.option {
  display: flex;
  align-items: center;
  padding: 1rem 1.2rem;
  margin-bottom: 0.8rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.option:hover {
  border-color: #f093fb;
  background: #fdf2f8;
}

.option.selected {
  border-color: #f093fb;
  background: #fdf2f8;
}

.option-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
}

.option.selected .option-circle {
  border-color: #f093fb;
}

.option-dot {
  width: 8px;
  height: 8px;
  background: #f093fb;
  border-radius: 50%;
}

.scale-container {
  text-align: center;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.scale-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.scale-btn {
  width: 50px;
  height: 50px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  background: white;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scale-btn:hover {
  border-color: #f093fb;
  color: #f093fb;
}

.scale-btn.selected {
  border-color: #f093fb;
  background: #f093fb;
  color: white;
}

.yes-no-buttons, .special-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  position: relative;
  min-height: 80px;
  align-items: center;
}

.special-buttons {
  min-height: 120px;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: #f093fb;
  color: white;
}

.btn-primary:hover {
  background: #e879f9;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-2px);
}

.btn-yes {
  background: #10b981;
  color: white;
}

.btn-yes:hover {
  background: #059669;
  transform: translateY(-2px);
}

.btn-no {
  background: #ef4444;
  color: white;
}

.btn-no:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.btn.selected {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.btn-special {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.moving-no {
  position: relative;
  user-select: none;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.completion-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.completion-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.romantic-success h2 {
  color: #ec4899;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.project-complete h2 {
  color: #10b981;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.romantic-success p, .project-complete p {
  color: #374151;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

@media (max-width: 640px) {
  .questionnaire {
    padding: 1rem 0;
  }
  
  .header h1 {
    font-size: 1.8rem;
  }
  
  .question-card {
    padding: 2rem 1.5rem;
  }
  
  .yes-no-buttons, .special-buttons {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .btn {
    width: 100%;
  }
  
  .scale-buttons {
    gap: 0.3rem;
  }
  
  .scale-btn {
    width: 40px;
    height: 40px;
  }
}
</style>