import {render, fireEvent, act} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from './App';

jest.mock('@react-native-async-storage/async-storage');

const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

AsyncStorage.getItem = mockAsyncStorage.getItem;
AsyncStorage.setItem = mockAsyncStorage.setItem;
AsyncStorage.removeItem = mockAsyncStorage.removeItem;

describe('App', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.spyOn(mockAsyncStorage, 'getItem').mockClear();
    jest.spyOn(mockAsyncStorage, 'setItem').mockClear();
    jest.spyOn(mockAsyncStorage, 'removeItem').mockClear();
  });

  it('should render the header', () => {
    const {getByText} = render(<App />);
    expect(getByText('Accessible Notes')).toBeTruthy();
  });

  it('should add a new note to the list of notes', async () => {
    const {findByTestId, getByTestId} = render(<App />);
    jest
      .spyOn(mockAsyncStorage, 'getItem')
      .mockResolvedValueOnce(JSON.stringify([]));

    await act(async () => {
      fireEvent.press(await findByTestId('add-note-button'));
      fireEvent.changeText(getByTestId('note-title-input'), 'Test Note');
      fireEvent.changeText(
        getByTestId('note-text-input'),
        'This is a test note',
      );
      fireEvent.press(getByTestId('save-note-button'));
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'notes',
      JSON.stringify([{title: 'Test Note', text: 'This is a test note'}]),
    );
  });
});
