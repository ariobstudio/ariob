import { useNavigate } from 'react-router';
import ariob from '../assets/ariob.png';

export function Header() {
  const navigate = useNavigate();
  
  return (
    <view className="Header">
      <view className="HeaderContent">
        <view className="HeaderLeft" bindtap={() => navigate('/')}>
          {/* <image src={ariob} className="HeaderLogo" /> */}
        </view>
      </view>
    </view>
  );
} 