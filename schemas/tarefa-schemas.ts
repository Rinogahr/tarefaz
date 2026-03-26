import dayjs from 'dayjs';
import { z } from 'zod';

const formatarDataPadrao = ({ dataIso }: { dataIso: string }): string => dayjs(dataIso).format('YYYY-MM-DDTHH:mm:ss');

const dataIsoSchema = z
  .union([z.iso.datetime({ local: true }), z.iso.datetime()])
  .transform((valor) => formatarDataPadrao({ dataIso: valor }));

export const usuarioTarefaSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().min(1),
  dados: z.string().min(1),
  photpth: z.string().min(1),
});

export const tarefaSchema = z
  .object({
    id: z.union([z.number().int().positive(), z.string().min(1)]),
    usuario: z.array(usuarioTarefaSchema).min(1),
    titulo: z.string().min(1),
    descricao: z.string().min(1),
    dataInicio: dataIsoSchema,
    dataFim: dataIsoSchema,
    feito: z.boolean(),
  })
  .refine(
    ({ dataInicio, dataFim }) =>
      dayjs(dataFim).isAfter(dayjs(dataInicio)) || dayjs(dataFim).isSame(dayjs(dataInicio)),
    {
      message: 'dataFim precisa ser igual ou posterior a dataInicio',
      path: ['dataFim'],
    },
  );

export const tarefasSchema = z.array(tarefaSchema);

export const criarTarefaInputSchema = z.object({
  usuario: z.array(usuarioTarefaSchema).min(1),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  dataInicio: dataIsoSchema,
  dataFim: dataIsoSchema,
  feito: z.boolean(),
});
