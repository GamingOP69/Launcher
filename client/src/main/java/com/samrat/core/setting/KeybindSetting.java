package com.samrat.core.setting;

public class KeybindSetting extends Setting<Integer> {
    public static final int KEY_NONE = 0;

    public KeybindSetting(String name, String description, int defaultKeyCode) {
        super(name, description, defaultKeyCode);
    }

    public boolean isBound() {
        return getValue() != null && getValue() != KEY_NONE;
    }

    public String getKeyName() {
        int code = getValue() != null ? getValue() : KEY_NONE;
        if (code == KEY_NONE) {
            return "NONE";
        }
        return getKeyNameFromCode(code);
    }

    public static String getKeyNameFromCode(int keyCode) {
        switch (keyCode) {
            case 54: return "RSHIFT";
            case 42: return "LSHIFT";
            case 29: return "LCONTROL";
            case 157: return "RCONTROL";
            case 56: return "LMENU";
            case 184: return "RMENU";
            case 57: return "SPACE";
            case 28: return "RETURN";
            case 1: return "ESCAPE";
            case 14: return "BACK";
            case 15: return "TAB";
            case 16: return "Q";
            case 17: return "W";
            case 18: return "E";
            case 19: return "R";
            case 20: return "T";
            case 21: return "Y";
            case 22: return "U";
            case 23: return "I";
            case 24: return "O";
            case 25: return "P";
            case 30: return "A";
            case 31: return "S";
            case 32: return "D";
            case 33: return "F";
            case 34: return "G";
            case 35: return "H";
            case 36: return "J";
            case 37: return "K";
            case 38: return "L";
            case 44: return "Z";
            case 45: return "X";
            case 46: return "C";
            case 47: return "V";
            case 48: return "B";
            case 49: return "N";
            case 50: return "M";
            case 59: return "F1";
            case 60: return "F2";
            case 61: return "F3";
            case 62: return "F4";
            case 63: return "F5";
            case 64: return "F6";
            case 65: return "F7";
            case 66: return "F8";
            case 67: return "F9";
            case 68: return "F10";
            case 87: return "F11";
            case 88: return "F12";
            default: return "KEY_" + keyCode;
        }
    }

    @Override
    public String getSerializedValue() {
        return String.valueOf(getValue());
    }

    @Override
    public void deserializeValue(String serialized) {
        if (serialized != null) {
            try {
                setValue(Integer.parseInt(serialized));
            } catch (NumberFormatException ignored) {}
        }
    }
}
