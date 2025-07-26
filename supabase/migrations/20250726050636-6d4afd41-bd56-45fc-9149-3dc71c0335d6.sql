-- Fix the infinite recursion in user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON user_roles;

-- Create simple policies without recursion
CREATE POLICY "Users can view their own roles" 
ON user_roles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
ON user_roles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = auth.uid() 
  AND ur.role = 'admin'
));