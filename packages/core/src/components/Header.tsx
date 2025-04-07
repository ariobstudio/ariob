import { useNavigate } from 'react-router';
import eraLogo from '../assets/era.png';

export function Header() {
  const navigate = useNavigate();
  
  return (
    <view className="Header">
      <view className="HeaderContent">
        <view className="HeaderLeft" bindtap={() => navigate('/')}>
          <image src={eraLogo} className="HeaderLogo" />
        </view>
      </view>
    </view>
  );
} 