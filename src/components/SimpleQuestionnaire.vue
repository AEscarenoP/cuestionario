<template>
  <div class="questionnaire">
    <div class="wave-bg"></div>
    <div class="blur-overlay"></div>
    <div class="container">
      <div class="header">
        <h1>Encuesta de Aplicación de Productividad</h1>
        <p>Ayúdanos a crear la app perfecta para ti</p>
      </div>
      
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="progress-text">{{ currentStep + 1 }} de {{ questions.length }} preguntas</div>
      
      <div v-if="!isCompleted" class="question-card">
        <h2>{{ questions[currentStep].question }}</h2>
        
        <div class="input-group">
          <!-- Email Input -->
          <div v-if="questions[currentStep].type === 'email'" class="email-input-container">
            <input
              type="email"
              v-model="currentAnswer"
              :placeholder="questions[currentStep].placeholder"
              class="text-input email-input"
              @input="validateEmail"
            />
            <div v-if="emailError" class="error-message">{{ emailError }}</div>
          </div>
          
          <!-- Multiple Choice Options -->
          <div v-else>
            <div 
              v-for="option in questions[currentStep].options" 
              :key="option"
              class="option"
              :class="{ 'selected': currentAnswer === option }"
              @click="selectAnswer(option)"
            >
              <div class="option-circle">
                <div v-if="currentAnswer === option" class="option-dot"></div>
              </div>
              <span>{{ option }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="currentStep === questions.length - 1" class="special-question">
          <div class="special-buttons-container">
            <button
              class="btn btn-yes btn-special"
              :class="{ 'selected': currentAnswer === 'Sí' }"
              @click="selectAnswer('Sí')"
            >
              Sí
            </button>
            <button
              v-if="!noButtonMoved"
              ref="noButton"
              class="btn btn-no btn-special moving-no"
              :style="noButtonStyle"
              @click="moveAndHideNoButton"
              @mouseenter="moveAndHideNoButton"
            >
              No
            </button>
          </div>
        </div>
      </div>

      <!-- Success Screen -->
      <div v-else class="completion-screen">
        <div class="completion-card">
          <div v-if="finalAnswer === 'Sí'" class="romantic-success">
            <h2>¡Qué emoción!</h2>
            <p>Me hace muy feliz tu respuesta. Pronto me pondré en contacto contigo para planear nuestra cita.</p>
          </div>
          <div v-else class="survey-complete">
            <h2>Encuesta Completada</h2>
            <p>Gracias por completar el cuestionario. Tus respuestas han sido guardadas exitosamente.</p>
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
          v-if="canContinue && currentStep === questions.length - 1 && currentAnswer === 'Sí'"
          @click="nextQuestion"
          class="btn btn-success"
        >
          Finalizar 💕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const questions = [
  {
    question: "¿Cuál es tu correo electrónico?",
    type: "email",
    placeholder: "ejemplo@correo.com"
  },
  {
    question: "¿Qué tan seguido organizas tus tareas o actividades diarias?",
    options: ["Nunca", "A veces", "Siempre"]
  },
  {
    question: "¿Qué herramientas usas actualmente para organizarte?",
    options: ["Agenda física", "App de tareas", "Notas en el teléfono", "Ninguna", "Otra"]
  },
  {
    question: "¿Qué tan importante es para ti tener recordatorios de tus tareas?",
    options: ["Nada importante", "Poco importante", "Muy importante"]
  },
  {
    question: "¿Te gustaría que una aplicación te ayudara también a cuidar tu salud mental además de organizar tus tareas?",
    options: ["Sí", "No", "Tal vez"]
  },
  {
    question: "¿Qué función te resultaría más útil en una app de organización?",
    options: ["Calendario integrado", "Listas de tareas", "Seguimiento de hábitos", "Gestión de finanzas", "Otro"]
  },
  {
    question: "¿En qué área sientes que necesitas más apoyo para organizarte?",
    options: ["Personal", "Laboral", "Estudios", "Finanzas"]
  },
  {
    question: "¿Con qué frecuencia revisarías la aplicación para gestionar tus actividades?",
    options: ["Varias veces al día", "Una vez al día", "Una vez a la semana"]
  },
  {
    question: "¿Te motivaría recibir mensajes o notificaciones con consejos de productividad y bienestar?",
    options: ["Sí", "No", "Indiferente"]
  },
  {
    question: "¿Te gustaría poder personalizar el diseño y modo de la aplicación según tu estilo o estado de ánimo?",
    options: ["Sí", "No"]
  },
  {
    question: "Si esta aplicación existiera, ¿la recomendarías a otras personas?",
    options: ["Sí", "No", "Depende de las funciones"]
  },
  {
    question: "Y finalmente... ¿Quieres salir conmigo?",
    options: ["Sí", "No"]
  }
]

const currentStep = ref(0)
const answers = ref<Record<number, string>>({})
const currentAnswer = ref('')
const isCompleted = ref(false)
const finalAnswer = ref('')
const noButton = ref<HTMLElement>()
const noButtonPosition = ref({ x: 0, y: 0 })
const noButtonMoved = ref(false)
const emailError = ref('')
const sessionId = ref<string>('')

const progressPercentage = computed(() => ((currentStep.value + 1) / questions.length) * 100)
const canContinue = computed(() => {
  if (questions[currentStep.value].type === 'email') {
    return isValidEmail(currentAnswer.value) && !emailError.value
  }
  return currentAnswer.value.trim() !== ''
})

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateEmail() {
  if (currentAnswer.value && !isValidEmail(currentAnswer.value)) {
    emailError.value = 'Por favor ingresa un correo electrónico válido'
  } else {
    emailError.value = ''
  }
}

const noButtonStyle = computed(() => ({
  transform: `translate(${noButtonPosition.value.x}px, ${noButtonPosition.value.y}px)`,
  transition: 'transform 0.3s ease-out'
}))

async function createSession() {
  const { data, error } = await supabase
    .from('questionnaire_sessions')
    .insert({ completed: false })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    return null
  }

  sessionId.value = data?.id || ''
  return data?.id
}

async function saveResponse(questionIndex: number, answer: string) {
  if (!sessionId.value) return

  const { error } = await supabase
    .from('responses')
    .insert({
      session_id: sessionId.value,
      question_text: questions[questionIndex].question,
      answer: answer,
      question_order: questionIndex + 1
    })

  if (error) {
    console.error('Error saving response:', error)
  }
}

async function sendEmail(email: string, responses: Record<number, string>) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        responses: responses,
        finalAnswer: finalAnswer.value
      }),
    })
    
    if (!response.ok) {
      throw new Error('Error enviando correo')
    }
  } catch (error) {
    console.error('Error enviando correo:', error)
  }
}

function selectAnswer(option: string) {
  currentAnswer.value = option
}

function moveAndHideNoButton() {
  // Mover el botón
  const maxMove = 100
  noButtonPosition.value = {
    x: Math.random() * maxMove - maxMove / 2,
    y: Math.random() * 60 - 30
  }
  
  // Después de un tiempo, ocultar completamente el botón
  setTimeout(() => {
    noButtonMoved.value = true
  }, 500)
}

async function nextQuestion() {
  // Guardar respuesta en Supabase
  await saveResponse(currentStep.value, currentAnswer.value)
  
  answers.value[currentStep.value] = currentAnswer.value
  
  if (currentStep.value === questions.length - 1) {
    finalAnswer.value = currentAnswer.value
    
    // Completar sesión
    await supabase
      .from('questionnaire_sessions')
      .update({ 
        completed: true, 
        final_answer: finalAnswer.value,
        user_email: answers.value[0] // El email es la primera respuesta
      })
      .eq('id', sessionId.value)
    
    // Enviar correo si respondió "Sí"
    if (finalAnswer.value === 'Sí') {
      await sendEmail(answers.value[0], answers.value)
    }
    
    isCompleted.value = true
    return
  }
  
  currentStep.value++
  currentAnswer.value = answers.value[currentStep.value] || ''
}

function previousQuestion() {
  if (currentStep.value > 0) {
    currentStep.value--
    currentAnswer.value = answers.value[currentStep.value] || ''
  }
}

async function restartForm() {
  currentStep.value = 0
  answers.value = {}
  currentAnswer.value = ''
  isCompleted.value = false
  finalAnswer.value = ''
  emailError.value = ''
  noButtonPosition.value = { x: 0, y: 0 }
  noButtonMoved.value = false
  await createSession()
}

// Inicializar sesión al cargar el componente
async function initializeForm() {
  await createSession()
}

// Ejecutar al montar el componente
initializeForm()

function moveNoButton() {
  const maxMove = 150
  noButtonPosition.value = {
    x: Math.random() * maxMove - maxMove / 2,
    y: Math.random() * 80 - 40
  }
}
</script>

<style scoped>
.questionnaire {
  min-height: 100vh;
  background: #1a1b2e;
  padding: 2rem 0;
  position: relative;
  overflow: hidden;
}

/* Ondas de colores difuminadas */
.wave-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  
  /* Gradientes superpuestos que simulan ondas */
  background: 
    radial-gradient(ellipse 1200px 800px at 20% 30%, 
        rgba(255, 100, 80, 0.4) 0%, 
        rgba(255, 120, 100, 0.3) 20%, 
        transparent 60%),
    radial-gradient(ellipse 1000px 600px at 80% 20%, 
        rgba(100, 150, 255, 0.3) 0%, 
        rgba(120, 100, 255, 0.25) 25%, 
        transparent 65%),
    radial-gradient(ellipse 800px 1000px at 60% 80%, 
        rgba(255, 150, 50, 0.35) 0%, 
        rgba(200, 100, 150, 0.2) 30%, 
        transparent 70%),
    radial-gradient(ellipse 1400px 700px at 10% 70%, 
        rgba(80, 200, 255, 0.25) 0%, 
        rgba(150, 80, 255, 0.2) 40%, 
        transparent 80%);
  
  /* Filtro blur para el efecto ondulado */
  filter: blur(100px);
  transform: scale(1.2);
  animation: wave-movement 20s ease-in-out infinite;
}

/* Overlay blur adicional */
.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  backdrop-filter: blur(3px);
  background: rgba(0, 0, 0, 0.1);
}

/* Animación de las ondas para movimiento sutil */
@keyframes wave-movement {
  0%, 100% { 
    transform: scale(1.2) rotate(0deg) translateX(0px) translateY(0px); 
  }
  25% { 
    transform: scale(1.25) rotate(1deg) translateX(10px) translateY(-5px); 
  }
  50% { 
    transform: scale(1.15) rotate(-0.5deg) translateX(-5px) translateY(10px); 
  }
  75% { 
    transform: scale(1.3) rotate(0.5deg) translateX(8px) translateY(-8px); 
  }
}

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 3;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-text {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.step {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.step.active {
  background: white;
  color: #667eea;
}

.question-card {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}

.question-card h2 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #f7fafc;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
  padding: 0 1rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin-top: 1.5rem;
}

.text-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  color: #f7fafc;
  backdrop-filter: blur(10px);
}

.text-input:focus {
  border-color: #f093fb;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
}

.text-input::placeholder {
  color: rgba(247, 250, 252, 0.7);
}

.email-input-container {
  width: 100%;
}

.email-input {
  margin-bottom: 0.5rem;
}

.error-message {
  color: #f87171;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding-left: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.option {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  min-height: 65px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0.5rem;
}

.option:hover {
  border-color: rgba(240, 147, 251, 0.7);
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(240, 147, 251, 0.15);
}

.option.selected {
  border-color: #f093fb;
  background: rgba(240, 147, 251, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(240, 147, 251, 0.25);
}

.option-circle {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.option.selected .option-circle {
  border-color: #f093fb;
  background: rgba(240, 147, 251, 0.1);
}

.option-dot {
  width: 10px;
  height: 10px;
  background: #f093fb;
  border-radius: 50%;
}

.option span {
  font-size: 1rem;
  font-weight: 500;
  color: #f7fafc;
  line-height: 1.4;
  word-wrap: break-word;
  flex: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.special-question {
  margin-top: 1.5rem;
}

.special-buttons-container {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  position: relative;
  min-height: 120px;
  align-items: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
}

.btn-success {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.btn-success:hover {
  background: linear-gradient(135deg, #3bb3aa 0%, #3a8b7a 100%);
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-yes {
  background: #10b981;
  color: white;
}

.btn-yes:hover {
  background: #059669;
}

.btn-no {
  background: #ef4444;
  color: white;
}

.btn-no:hover {
  background: #dc2626;
}

.btn.selected {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-special {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.moving-no {
  position: relative;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.success-message {
  text-align: center;
  margin-top: 2rem;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 8px;
}

.success-message h3 {
  color: #10b981;
  margin-bottom: 0.5rem;
}

.success-message p {
  color: #374151;
}

.completion-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.completion-card {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.romantic-success h2 {
  color: #ec4899;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.survey-complete h2 {
  color: #10b981;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.romantic-success p, .survey-complete p {
  color: #e2e8f0;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@media (max-width: 640px) {
  .questionnaire {
    padding: 1rem 0;
  }
  
  .header h1 {
    font-size: 1.8rem;
  }
  
  .header p {
    font-size: 1rem;
  }
  
  .question-card {
    padding: 2rem 1.5rem;
    margin: 0 0.5rem 2rem 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .question-card h2 {
    font-size: 1.2rem;
    padding: 0 0.5rem;
  }
  
  .option {
    padding: 0.875rem 1rem;
    min-height: 56px;
  }
  
  .option span {
    font-size: 0.95rem;
  }
  
  .option-circle {
    width: 20px;
    height: 20px;
    margin-right: 0.75rem;
  }
  
  .option-dot {
    width: 8px;
    height: 8px;
  }
  
  .special-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
  }
  
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navigation .btn {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .completion-card {
    padding: 2rem 1.5rem;
    margin: 0 1rem;
  }
}
</style>