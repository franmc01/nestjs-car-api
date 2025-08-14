import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./modules/users/users.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./modules/users/users.entity";
import { Report } from "./modules/reports/report.entity";
import { Argon2HasherService } from "./shared/services/argon2-hasher.service";
import { APP_FILTER } from "@nestjs/core";
import { OptimisticLockFilter } from "./shared/filters/optimistic-lock/optimistic-lock.filter";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: "db.sqlite",
      entities: [User, Report],
      synchronize: true
    }),
    UsersModule,
    ReportsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: "IPasswordHasher",
      useClass: Argon2HasherService
    },
    {
      provide: APP_FILTER,
      useClass: OptimisticLockFilter
    }
  ]
})
export class AppModule {
}
