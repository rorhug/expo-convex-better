import { Ionicons } from "@expo/vector-icons";
import { api } from "@pdp/backend/convex/_generated/api";
import type { Id } from "@pdp/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Card, Checkbox, Chip, useThemeColor } from "heroui-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Container } from "@/components/container";

export default function TodosScreen() {
  const [newTodoText, setNewTodoText] = useState("");
  const todos = useQuery(api.todos.getAll);
  const createTodoMutation = useMutation(api.todos.create);
  const toggleTodoMutation = useMutation(api.todos.toggle);
  const deleteTodoMutation = useMutation(api.todos.deleteTodo);

  const mutedColor = useThemeColor("muted");
  const accentColor = useThemeColor("accent");
  const dangerColor = useThemeColor("danger");
  const foregroundColor = useThemeColor("foreground");

  const handleAddTodo = async () => {
    const text = newTodoText.trim();
    if (!text) {
      return;
    }
    await createTodoMutation({ text });
    setNewTodoText("");
  };

  const handleToggleTodo = (id: Id<"todos">, currentCompleted: boolean) => {
    toggleTodoMutation({ id, completed: !currentCompleted });
  };

  const handleDeleteTodo = (id: Id<"todos">) => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTodoMutation({ id }),
      },
    ]);
  };

  const isLoading = !todos;
  const completedCount = todos?.filter((t) => t.completed).length || 0;
  const totalCount = todos?.length || 0;

  return (
    <Container>
      <ScrollView className="flex-1" contentContainerClassName="p-6">
        <View className="mb-6">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-bold text-3xl text-foreground">
              Todo List
            </Text>
            {totalCount > 0 && (
              <Chip color="accent" size="sm" variant="secondary">
                <Chip.Label>
                  {completedCount}/{totalCount}
                </Chip.Label>
              </Chip>
            )}
          </View>
        </View>

        <Card className="mb-6 p-4" variant="secondary">
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <TextInput
                className="rounded-lg border border-divider bg-surface px-4 py-3 text-base text-foreground"
                onChangeText={setNewTodoText}
                onSubmitEditing={handleAddTodo}
                placeholder="Add a new task..."
                placeholderTextColor={mutedColor}
                returnKeyType="done"
                value={newTodoText}
              />
            </View>
            <Pressable
              className={`rounded-lg p-3 active:opacity-70 ${newTodoText.trim() ? "bg-accent" : "bg-surface"}`}
              disabled={!newTodoText.trim()}
              onPress={handleAddTodo}
            >
              <Ionicons
                color={newTodoText.trim() ? foregroundColor : mutedColor}
                name="add"
                size={24}
              />
            </Pressable>
          </View>
        </Card>

        {isLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator color={accentColor} size="large" />
            <Text className="mt-4 text-muted">Loading todos...</Text>
          </View>
        )}

        {todos && todos.length === 0 && !isLoading && (
          <Card className="items-center justify-center py-12">
            <Ionicons
              color={mutedColor}
              name="checkbox-outline"
              size={64}
              style={{ marginBottom: 16 }}
            />
            <Text className="mb-2 font-semibold text-foreground text-lg">
              No todos yet
            </Text>
            <Text className="text-center text-muted">
              Add your first task to get started!
            </Text>
          </Card>
        )}

        {todos && todos.length > 0 && (
          <View className="gap-3">
            {todos.map((todo) => (
              <Card className="p-4" key={todo._id} variant="secondary">
                <View className="flex-row items-center gap-3">
                  <Checkbox
                    isSelected={todo.completed}
                    onSelectedChange={() =>
                      handleToggleTodo(todo._id, todo.completed)
                    }
                  />
                  <View className="flex-1">
                    <Text
                      className={`text-base ${todo.completed ? "text-muted line-through" : "text-foreground"}`}
                    >
                      {todo.text}
                    </Text>
                  </View>
                  <Pressable
                    className="rounded-lg p-2 active:opacity-70"
                    onPress={() => handleDeleteTodo(todo._id)}
                  >
                    <Ionicons
                      color={dangerColor}
                      name="trash-outline"
                      size={24}
                    />
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Container>
  );
}
