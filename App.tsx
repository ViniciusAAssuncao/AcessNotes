import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Modal,
  TextInput,
  Button,
  Alert,
  PixelRatio,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isDarkMode = useColorScheme() === 'dark';

  interface Note {
    title: string;
    text: string;
  }

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotesString = await AsyncStorage.getItem('notes');
        const storedNotes = storedNotesString
          ? JSON.parse(storedNotesString)
          : [];
        setNotes(storedNotes);
      } catch (e) {
        console.log('Falha ao carregar as notas');
      }
    };

    loadNotes();
  }, []);

  const filteredNotes = notes.filter(
    note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteNote = async (index: number) => {
    const newNotes = [...notes];
    newNotes.splice(index, 1);
    await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const handleEditNote = (index: number) => {
    const note = notes[index];
    setNoteTitle(note.title);
    setNoteText(note.text);
    setEditingNoteIndex(index);
    setModalVisible(true);
  };

  const handleAddNote = async () => {
    const newNote = {
      title: noteTitle,
      text: noteText,
    };

    const storedNotes = [...notes];

    if (editingNoteIndex !== null) {
      storedNotes[editingNoteIndex] = newNote;
    } else {
      storedNotes.push(newNote);
    }

    try {
      await AsyncStorage.setItem('notes', JSON.stringify(storedNotes));
      Alert.alert('Sucesso', 'Nota armazenada com sucesso');
      setNotes(storedNotes);
      setModalVisible(false);
      setEditingNoteIndex(null);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao armazenar a nota');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#352F44'}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{flex: 1}}>
        <View style={styles.container}>
          <Text style={styles.header}>Accessible Notes</Text>
          <TextInput
            style={{
              width: '100%',
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              margin: 10,
            }}
            placeholder="Pesquisar..."
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />
          <View style={styles.content}>
            {filteredNotes.map((note, index) => (
              <TouchableOpacity
                key={index}
                style={styles.noteContainer}
                accessible={true}
                accessibilityLabel={`Editar nota: ${note.title}`}>
                <Text
                  style={styles.noteTitle}
                  onPress={() => handleEditNote(index)}>
                  {note.title}
                </Text>
                <Text
                  style={styles.editText}
                  onPress={() => handleEditNote(index)}>
                  Editar
                </Text>
                <TouchableOpacity onPress={() => handleDeleteNote(index)}>
                  <Text style={styles.deleteText}>Deletar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setNoteTitle('');
          setNoteText('');
          setEditingNoteIndex(null);
          setModalVisible(true);
        }}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalView}>
          <TextInput
            placeholder="Título da Anotação"
            style={styles.noteInput}
            onChangeText={setNoteTitle}
            value={noteTitle}
            accessibilityLabel="Título da Anotação"
          />
          <TextInput
            placeholder="Texto da Anotação"
            style={[styles.noteInput, {height: 100}]}
            multiline={true}
            onChangeText={setNoteText}
            value={noteText}
            accessibilityLabel="Texto da Anotação"
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancelar"
              onPress={() => {
                setModalVisible(false);
                setEditingNoteIndex(null);
              }}
              accessibilityLabel="Cancelar a edição da nota"
            />
            <Button
              title="Salvar"
              onPress={handleAddNote}
              accessibilityLabel="Salvar a nota"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
    backgroundColor: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 10,
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: '#232D3F',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 24,
  },
  addButtonText: {
    fontSize: 36,
    color: 'white',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  noteInput: {
    width: 200,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
  },
  noteContainer: {
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: 18,
    flex: 1,
  },
  editText: {
    color: 'blue',
    marginLeft: 10,
  },
  deleteText: {
    color: 'red',
    marginLeft: 10,
  },
});

export default App;
