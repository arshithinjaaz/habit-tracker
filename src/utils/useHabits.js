import { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { database } from '../config/firebase';

export const useHabits = (userId = 'demo-user') => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const habitsRef = ref(database, `users/${userId}/habits`);
    
    const unsubscribe = onValue(habitsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const habitsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setHabits(habitsArray);
      } else {
        setHabits([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      // Fallback to local storage if Firebase fails
      try {
        const localHabits = localStorage.getItem('habits');
        if (localHabits) {
          setHabits(JSON.parse(localHabits));
        }
      } catch (parseError) {
        console.error('Error parsing local habits:', parseError);
        setHabits([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addHabit = async (habitData) => {
    try {
      const habitsRef = ref(database, `users/${userId}/habits`);
      await push(habitsRef, {
        ...habitData,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error('Error adding habit:', error);
      // Fallback to local storage
      const newHabit = { id: Date.now().toString(), ...habitData, createdAt: Date.now() };
      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);
      localStorage.setItem('habits', JSON.stringify(updatedHabits));
    }
  };

  const updateHabit = async (habitId, updates) => {
    try {
      const habitRef = ref(database, `users/${userId}/habits/${habitId}`);
      await update(habitRef, updates);
    } catch (error) {
      console.error('Error updating habit:', error);
      // Fallback to local storage
      const updatedHabits = habits.map(h => 
        h.id === habitId ? { ...h, ...updates } : h
      );
      setHabits(updatedHabits);
      localStorage.setItem('habits', JSON.stringify(updatedHabits));
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      const habitRef = ref(database, `users/${userId}/habits/${habitId}`);
      await remove(habitRef);
    } catch (error) {
      console.error('Error deleting habit:', error);
      // Fallback to local storage
      const updatedHabits = habits.filter(h => h.id !== habitId);
      setHabits(updatedHabits);
      localStorage.setItem('habits', JSON.stringify(updatedHabits));
    }
  };

  return { habits, loading, addHabit, updateHabit, deleteHabit };
};
