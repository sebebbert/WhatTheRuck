import { useMatch } from '../context/MatchContext';
import { PasswordSetup } from '../components/PasswordSetup';
import { ChangePassword } from '../components/ChangePassword';

export function PasswordPage() {
  const { isPasswordSet } = useMatch();

  return isPasswordSet ? <ChangePassword /> : <PasswordSetup />;
}