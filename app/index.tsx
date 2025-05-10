import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Button, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Record<string, { id: number; task: string }[]>>({
    "2025-04-01": [{ id: 1, task: "Test task 01" }],
    "2025-04-02": [
      { id: 1, task: "Test task 02" },
      { id: 2, task: "Test task 03" },
    ],
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<{ id: number; task: string } | null>(null);
  const [editedTaskText, setEditedTaskText] = useState('');

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const handleAddTask = () => {
    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }
    setModalVisible(true);
  };

  const saveTask = () => {
    if (!newTaskText.trim()) return;

    const updatedTasks = { ...tasks };
    const date = selectedDate as string;

    const newTask = {
      id: Date.now(),
      task: newTaskText.trim(),
    };

    if (!updatedTasks[date]) {
      updatedTasks[date] = [];
    }

    updatedTasks[date].push(newTask);
    setTasks(updatedTasks);
    setNewTaskText('');
    setModalVisible(false);
  };

  const handleEditPress = (task: { id: number; task: string }) => {
    setCurrentTask(task);
    setEditedTaskText(task.task);
    setEditModalVisible(true);
  };

  const saveEditedTask = () => {
    if (!selectedDate || !currentTask) return;

    const updated = tasks[selectedDate].map((t) =>
      t.id === currentTask.id ? { ...t, task: editedTaskText } : t
    );

    setTasks({ ...tasks, [selectedDate]: updated });
    setEditModalVisible(false);
  };

  const deleteTask = () => {
    if (!selectedDate || !currentTask) return;

    const filtered = tasks[selectedDate].filter((t) => t.id !== currentTask.id);
    setTasks({ ...tasks, [selectedDate]: filtered });
    setEditModalVisible(false);
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error("Failed to load tasks", error);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks", error);
      }
    };
    saveTasks();
  }, [tasks]);

  return (
    <>
      <View style={styles.container1}>
        {/* Add Task Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={[styles.headerText, { marginBottom: 10 }]}>
                Add Task for {selectedDate}
              </Text>
              <TextInput
                placeholder="Enter task"
                style={styles.input}
                value={newTaskText}
                onChangeText={setNewTaskText}
              />
              <Button title="Save Task" onPress={saveTask} />
              <View style={{ height: 10 }} />
              <Button title="Cancel" color="gray" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>

        {/* Edit/Delete Task Modal */}
        <Modal
          visible={editModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={[styles.headerText, { marginBottom: 10 }]}>
                Edit Task
              </Text>
              <TextInput
                placeholder="Edit task"
                style={styles.input}
                value={editedTaskText}
                onChangeText={setEditedTaskText}
              />
              <Button title="Save Changes" onPress={saveEditedTask} />
              <View style={{ height: 10 }} />
              <Button title="Delete Task" color="red" onPress={deleteTask} />
              <View style={{ height: 10 }} />
              <Button title="Cancel" color="gray" onPress={() => setEditModalVisible(false)} />
            </View>
          </View>
        </Modal>

        {/* Plus Icon */}
        <Pressable style={styles.addButton} onPress={handleAddTask}>
          <Ionicons name="add-circle" size={40} color="black" />
        </Pressable>

        {/* Profile Icon */}
        <Link href="/profile" style={styles.profileLink}>
          <Ionicons name="person-circle" size={40} color="black" />
        </Link>

        <StatusBar style="auto" />

        <Calendar
          onDayPress={handleDayPress}
          markedDates={Object.keys(tasks).reduce((acc, date) => {
            if (tasks[date] && tasks[date].length > 0) {
              acc[date] = { marked: true, dotColor: "red" };
            }
            return acc;
          }, {} as Record<string, any>)}
          theme={{
            todayTextColor: "red",
            selectedDayBackgroundColor: "red",
            selectedDayTextColor: "white",
            calendarBackground: "#ffffff",
            dayTextColor: "#333333",
            textDisabledColor: "#d9e1e8",
          }}
          style={styles.calendar}
        />

        {/* Task List */}
        <View style={styles.taskContainer}>
          <Text style={styles.headerText}>
            Tasks for {selectedDate || "Select a date"}:
          </Text>
          <FlatList
            data={selectedDate ? tasks[selectedDate] || [] : []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleEditPress(item)}>
                <View style={styles.card}>
                  <Text style={styles.taskText}>{item.task}</Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.noTaskText}>
                No tasks for this date
              </Text>
            )}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
  },
  profileLink: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
    color: 'red',
  },
  addButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
  },
  calendar: {
    flex: 0.6,
    width: "100%",
    backgroundColor: "#ffffff",
  },
  taskContainer: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333333",
  },
  card: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskText: {
    fontSize: 16,
    color: "#333333"
  },
  noTaskText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "gray"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 10,
    padding: 20,
    backgroundColor: "white",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderColor: '#ccc',
    color: 'black',
  },
});
