-- Tabla de preguntas del cuestionario
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'multiple_choice', 'yes_no', 'special')),
    options JSONB, -- Para opciones de multiple choice
    required BOOLEAN DEFAULT true,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de cuestionario
CREATE TABLE IF NOT EXISTS questionnaire_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed BOOLEAN DEFAULT false,
    final_answer VARCHAR(10), -- 'Sí' o 'No' para la pregunta especial
    user_email VARCHAR(255) -- Email del usuario
);

-- Tabla de respuestas
CREATE TABLE IF NOT EXISTS responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL, -- Texto de la pregunta
    answer TEXT NOT NULL,
    question_order INTEGER NOT NULL, -- Orden de la pregunta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_responses_session ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_order ON responses(question_order);

-- Políticas de seguridad (RLS)
-- Permitir insertar y leer sesiones
ALTER TABLE questionnaire_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert sessions" ON questionnaire_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read sessions" ON questionnaire_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can update sessions" ON questionnaire_sessions FOR UPDATE USING (true);

-- Permitir insertar y leer respuestas  
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert responses" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read responses" ON responses FOR SELECT USING (true);

-- Las preguntas ahora se manejan desde el frontend
-- Solo mantenemos la estructura de las tablas