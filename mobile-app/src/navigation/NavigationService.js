import {CommonActions} from '@react-navigation/native';

export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

export function goBack() {
  navigationRef.current?.goBack();
}

export function resetToScreen(routeName) {
  navigationRef.current?.reset({
    index: 0,
    routes: [{name: routeName}],
  });
}

export function resetToAuth() {
  resetToScreen('Login');
}

export function resetToMain() {
  resetToScreen('Main');
}
