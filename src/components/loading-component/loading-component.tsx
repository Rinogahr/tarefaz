import loadingStyle from './loading-component.module.css';

interface LoadingComponentProps {
  texto?: string;
}

export const LoadingComponent = ({ texto = 'Carregando dados do sistema...' }: LoadingComponentProps) => {
  return (
    <div className={loadingStyle.loadingContainer}>
      <div className={loadingStyle.loadingCard}>
        <span className={loadingStyle.spinner} />
        <p>{texto}</p>
      </div>
    </div>
  );
};
