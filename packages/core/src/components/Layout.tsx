import '../App.css';
import { ScrollableContent } from './ScrollableContent';
import { Header } from './Header';

export function Layout({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <view className="LayoutRoot">
      <Header />
      <view className="App">
        <ScrollableContent className="ContentWrapper">
          <view className="Content">
            <text className="PageTitle">
              {title || 'Security Encryption Authentication'}
            </text>
            {children}
          </view>
        </ScrollableContent>
      </view>
    </view>
  );
} 