import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const [allTasks, setAllTasks] = useState<Record<string, { id: number; task: string }[]>>({});
  const [editingTask, setEditingTask] = useState<{ date: string; id: number } | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks');
        if (savedTasks) {
          setAllTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error('Failed to load tasks', error);
      }
    };
    loadTasks();
  }, []);

  const saveTasks = async (updatedTasks: Record<string, { id: number; task: string }[]>) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setAllTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to save tasks', error);
    }
  };

  const handleDelete = (date: string, id: number) => {
    const tasksForDate = allTasks[date];
    if (!tasksForDate) return;
  
    const filtered = tasksForDate.filter((t) => t.id !== id);
    const updated = { ...allTasks };
  
    if (filtered.length === 0) {
      delete updated[date];
    } else {
      updated[date] = filtered;
    }
  
    saveTasks(updated);
  };

  const handleEdit = (date: string, id: number, currentText: string) => {
    setEditingTask({ date, id });
    setNewTaskText(currentText);
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;
    const { date, id } = editingTask;
    const updated = {
      ...allTasks,
      [date]: allTasks[date].map((task) =>
        task.id === id ? { ...task, task: newTaskText } : task
      ),
    };
    saveTasks(updated);
    setEditingTask(null);
    setNewTaskText('');
  };

  const taskEntries = Object.entries(allTasks).sort(([a], [b]) => (a < b ? 1 : -1));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Tasks</Text>
      {taskEntries.length === 0 ? (
        <Text style={styles.noTasks}>No tasks available</Text>
      ) : (
        <FlatList
          data={taskEntries}
          keyExtractor={([date]) => date}
          renderItem={({ item: [date, tasks] }) => (
            <View style={styles.section}>
              <Text style={styles.dateText}>{date}</Text>
              {tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  {editingTask?.id === task.id && editingTask?.date === date ? (
                    <View style={styles.editRow}>
                      <TextInput
                        value={newTaskText}
                        onChangeText={setNewTaskText}
                        style={styles.input}
                      />
                      <TouchableOpacity onPress={handleSaveEdit}>
                        <Ionicons name="checkmark" size={24} color="green" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.taskRow}>
                      <Text style={styles.taskText}>{task.task}</Text>
                      <View style={styles.buttons}>
                        <TouchableOpacity
                          onPress={() => handleEdit(date, task.id, task.task)}
                          style={styles.iconButton}
                        >
                          <Ionicons name="pencil" size={20} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert(
                              'Delete Task',
                              'Are you sure you want to delete this task?',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', onPress: () => handleDelete(date, task.id), style: 'destructive' },
                              ]
                            )
                          }
                          style={styles.iconButton}
                        >
                          <Ionicons name="trash" size={20} color="#cc0000" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  section: {
    marginBottom: 16
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#444' },
  taskCard: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  buttons: {
    flexDirection: 'row'
  },
  iconButton: {
    marginLeft: 10
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    borderWidth: 1,
    padding: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  noTasks: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray'
  },
});