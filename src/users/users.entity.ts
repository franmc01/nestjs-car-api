import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
} from 'typeorm';
// import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  // Importante porque con esto no se selecciona por defecto y además se excluye en la serialización.
  // Para algo más grande se recomienda
  // usar DTO + interceptor
  // @Exclude()
  @Column({ select: false })
  password!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  // Para optimistic locking (TypeORM añade WHERE version = x y autoincrementa)
  // Esto es una estrategia para evitar que dos usuarios actualicen el mismo registro al mismo tiempo
  @VersionColumn()
  version!: number;
}
