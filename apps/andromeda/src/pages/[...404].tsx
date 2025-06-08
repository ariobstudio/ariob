import { Column } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
import { BaseLayout } from '@/layouts';
import { useNavigate } from 'react-router';

import notFoundDark from '@/assets/not-found-dark.png';
import notFoundLight from '@/assets/not-found-light.png';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { withTheme } = useTheme();
  const notFoundImage = withTheme(notFoundLight, notFoundDark);

  const handleGoHome = () => {
    console.log('handleGoHome');
    navigate('/');
  };

  const handleGoBack = () => {
    console.log('handleGoBack');
    navigate(-1);
  };

  return (
    <view className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-muted-foreground">
            404
          </CardTitle>

          <text className="text-xl font-semibold">Page Not Found</text>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* @ts-ignore */}
          <image src={notFoundImage} className="w-72 h-72" mode="aspectFit" />
          <text className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </text>
          <Column spacing="md" align="center" width="auto">
            <Button icon="house" size="lg" onClick={handleGoHome}>
              Go Home
            </Button>
            <Button
              icon="arrow-left"
              size="lg"
              onClick={handleGoBack}
              variant="outline"
            >
              Go Back
            </Button>
          </Column>
        </CardContent>
      </Card>
    </view>
  );
};

export default NotFoundPage;
