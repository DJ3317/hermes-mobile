/**
 * 消息输入组件
 */

import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getColors, resolveColorScheme, spacing, typography, borderRadius } from '../theme/colors';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '输入消息...',
}) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (canSend) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.inputRow, { borderColor: colors.borderLight, backgroundColor: colors.background }]}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={4000}
            style={[
              styles.input,
              { color: colors.text },
            ]}
            editable={!disabled}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: canSend ? colors.primary : colors.borderLight,
                opacity: canSend ? 1 : 0.5,
              },
            ]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.7}
          >
            <Text style={[styles.sendIcon, { color: canSend ? '#FFFFFF' : colors.textTertiary }]}>
              ↑
            </Text>
          </TouchableOpacity>
        </View>
        {disabled && (
          <Text style={[styles.disabledHint, { color: colors.textTertiary }]}>
            等待响应...
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.body,
    maxHeight: 120,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  disabledHint: {
    ...typography.small,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
