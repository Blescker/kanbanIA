import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  nombre: string;
  descripcion: string;
}

export const ProjectCard = ({ id, nombre, descripcion }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-black dark:text-white shadow-md rounded p-4 hover:shadow-lg transition cursor-pointer"
    >
      <h3 className="text-3xl font-bold mb-1">{nombre}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{descripcion}</p>
      
    </div>
  );
};
