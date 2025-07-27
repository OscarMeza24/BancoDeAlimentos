-- Insertar categorías de alimentos
INSERT INTO food_categories (name, description, icon) VALUES
('Frutas y Verduras', 'Productos frescos, frutas y vegetales', '🥕'),
('Lácteos', 'Leche, queso, yogurt y derivados lácteos', '🥛'),
('Carnes y Proteínas', 'Carnes, pescados, huevos y proteínas', '🥩'),
('Granos y Cereales', 'Arroz, pasta, pan y cereales', '🌾'),
('Enlatados', 'Conservas y alimentos enlatados', '🥫'),
('Bebidas', 'Jugos, agua y otras bebidas', '🧃'),
('Productos de Panadería', 'Pan, pasteles y productos horneados', '🍞'),
('Condimentos y Especias', 'Sal, azúcar, especias y condimentos', '🧂'),
('Comida Preparada', 'Alimentos listos para consumir', '🍱'),
('Productos Congelados', 'Alimentos congelados', '🧊');

-- Insertar algunas campañas de ejemplo
INSERT INTO campaigns (title, description, goal_amount, image_url) VALUES
('Alimenta una Familia', 'Ayuda a proporcionar comidas nutritivas a familias necesitadas', 5000.00, '/placeholder.svg?height=300&width=400'),
('Navidad Solidaria', 'Campaña especial para las fiestas navideñas', 10000.00, '/placeholder.svg?height=300&width=400'),
('Apoyo Escolar', 'Programa de alimentación para estudiantes', 3000.00, '/placeholder.svg?height=300&width=400');

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON food_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON food_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
