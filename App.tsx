import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import * as SQLite from "expo-sqlite";
interface Entry {
  id: number,
  title: string,
  entry: string,
}

const openDatabase = () => {
  const db = SQLite.openDatabase("demoapp.db");
  return db;
}

const db = openDatabase();

export default function App() {
  const [title, setTitle] = React.useState<string>(""); // [string, React.Dispatch<React.SetStateAction<string>>]
  const [entry, setEntry] = React.useState<string>(""); 

  const [entries, setEntries] = React.useState<Entry[]>([]);

  const getEntries = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM entries;", [], (tx, resultSet) => {
          setEntries(resultSet.rows._array)
        }
      );
    },
    (error) => console.error(error),
    () => console.log("Data fetched"));
  }

  // Create Schema
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists entries (id integer primary key autoincrement, title varchar(255), entry text);"
      );
    },
    (error) => console.error(error),
    () => console.log("DB Successfully Created"));
  },[])

  // Get Entire Data when App starts at launch
  React.useEffect(() => {
    getEntries();
  },[])

  const handleAddEntry = () => {
    if(title.length > 0 && entry.length > 0) {
      // const newEntry = { title: title, entry: entry };
      db.transaction(
        (tx) => {
          tx.executeSql("insert into entries (title, entry) values (?, ?)", [title, entry]);
        },
        (error) => console.error(error)
      );
      getEntries();
      setTitle("");
      setEntry("");
    } else {
      Alert.alert("Add Entry Status", "You cannot add an empty/missing record")
    }
  }

  const handleDeleteEntry = (id: number) => {
    db.transaction(
      (tx) => {
        tx.executeSql("delete from entries where id=?", [id]);
      }
    );
    getEntries();
  }

  const handleUpdateEntry = (id: number, newTitle: string, newEntry: string) => {
    db.transaction(
      (tx) => {
        tx.executeSql("update entries set title=?, entry=?", [newTitle, newEntry]);
      }
    );
    getEntries();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Diary</Text>

      <View style={{margin:10}}/> 
      {/* Add Diary Entry Form */}
      <Text style={styles.inputLabel}>Title</Text>
      <TextInput 
        value={title}
        onChangeText={(newText) => {
          setTitle(newText)
        }}
        placeholder={"Write your title"}
      />
      <Text style={styles.inputLabel}>Entry</Text>
      <TextInput 
        value={entry}
        onChangeText={(newText) => {
          setEntry(newText)
        }}
        placeholder={"Write your entry..."}
      />
      <Button title={"Add Entry"} onPress={()=>{
        handleAddEntry()
      }} />

      <View style={{margin:10}}/> 

      <FlatList
        data={entries}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <TouchableOpacity onPress={()=>handleDeleteEntry(item.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
            <Text>{item.entry}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold"
  },
  card: {
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    marginBottom: 15,
  },
  cardHeader: {
    flex: 1, 
    flexDirection: "row",
    justifyContent: "space-between"
  },
  cardTitle: {
    fontSize: 20, 
    fontWeight: "bold"
  },
  inputLabel: {
    fontSize: 20,
  },
  deleteButton: {
    color: "red"
  }
});
