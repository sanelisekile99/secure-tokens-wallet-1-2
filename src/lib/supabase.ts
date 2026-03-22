import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://moiqyroivvnjmokpeold.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjUxYTc5YzE0LWJiMWYtNDViMC1hYjY2LTRlNWFhYzg1Mzk3OSJ9.eyJwcm9qZWN0SWQiOiJtb2lxeXJvaXZ2bmptb2twZW9sZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc0MTg4MDQ4LCJleHAiOjIwODk1NDgwNDgsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.jnZEHNemZ6ZVdwTTKxeGZoKQcxcwlIPWMuWFM-2hYH0';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };