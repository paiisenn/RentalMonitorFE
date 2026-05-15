import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
          <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-zinc-800 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-black text-white uppercase tracking-tighter">HỆ THỐNG GẶP LỖI</h1>
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                Đã có một lỗi không mong muốn xảy ra. Chúng tôi đang kiểm tra sự cố này.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-left">
              <p className="text-[9px] font-mono text-zinc-600 uppercase mb-1">Error Trace:</p>
              <p className="text-[10px] font-mono text-red-400 break-all">{this.state.error?.message || 'Unknown error'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/'}
                leftIcon={<Home size={14} />}
              >
                TRANG CHỦ
              </Button>
              <Button 
                variant="primary" 
                className="w-full"
                onClick={this.handleReset}
                leftIcon={<RotateCcw size={14} />}
              >
                THỬ LẠI
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
