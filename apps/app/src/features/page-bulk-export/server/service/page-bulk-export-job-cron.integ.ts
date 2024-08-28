import mongoose from 'mongoose';

import { configManager } from '~/server/service/config-manager';

import { PageBulkExportFormat, PageBulkExportJobStatus } from '../../interfaces/page-bulk-export';
import PageBulkExportJob from '../models/page-bulk-export-job';

import instanciatePageBulkExportJobCronService, { pageBulkExportJobCronService } from './page-bulk-export-job-cron';

// TODO: use actual user model after ~/server/models/user.js becomes importable in vitest
// ref: https://github.com/vitest-dev/vitest/issues/846
const userSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
}, {
  timestamps: true,
});
const User = mongoose.model('User', userSchema);

vi.mock('./page-bulk-export', () => {
  return {
    pageBulkExportService: {
      cleanUpExportJobResources: vi.fn(() => Promise.resolve()),
    },
  };
});

describe('PageBulkExportJobCronService', () => {
  const crowi = { event: () => {} };
  let user;

  beforeAll(async() => {
    user = await User.create({
      name: 'Example for PageBulkExportJobCronService Test',
      username: 'page bulk export job cron test user',
      email: 'bulkExportCronTestUser@example.com',
    });
    instanciatePageBulkExportJobCronService(crowi);
  });

  beforeEach(async() => {
    await PageBulkExportJob.deleteMany();
  });

  describe('deleteExpiredExportJobs', () => {
    // arrange
    const jobId1 = new mongoose.Types.ObjectId();
    const jobId2 = new mongoose.Types.ObjectId();
    const jobId3 = new mongoose.Types.ObjectId();
    const jobId4 = new mongoose.Types.ObjectId();
    beforeEach(async() => {
      await configManager.updateConfigsInTheSameNamespace('crowi', { 'app:bulkExportJobExpirationSeconds': 86400 }); // 1 day

      await PageBulkExportJob.insertMany([
        {
          _id: jobId1,
          user,
          page: new mongoose.Types.ObjectId(),
          format: PageBulkExportFormat.md,
          status: PageBulkExportJobStatus.initializing,
          createdAt: new Date(Date.now()),
        },
        {
          _id: jobId2,
          user,
          page: new mongoose.Types.ObjectId(),
          format: PageBulkExportFormat.md,
          status: PageBulkExportJobStatus.exporting,
          createdAt: new Date(Date.now() - 86400 * 1000 - 1),
        },
        {
          _id: jobId3,
          user,
          page: new mongoose.Types.ObjectId(),
          format: PageBulkExportFormat.md,
          status: PageBulkExportJobStatus.uploading,
          createdAt: new Date(Date.now() - 86400 * 1000 - 2),
        },
        {
          _id: jobId4, user, page: new mongoose.Types.ObjectId(), format: PageBulkExportFormat.md, status: PageBulkExportJobStatus.failed,
        },
      ]);
    });

    test('should delete expired jobs', async() => {
      expect(await PageBulkExportJob.find()).toHaveLength(4);

      // act
      await pageBulkExportJobCronService?.deleteExpiredExportJobs();
      const jobs = await PageBulkExportJob.find();

      // assert
      expect(jobs).toHaveLength(2);
      expect(jobs.map(job => job._id).sort()).toStrictEqual([jobId1, jobId4].sort());
    });
  });

  describe('deleteDownloadExpiredExportJobs', () => {
    // arrange
    const jobId1 = new mongoose.Types.ObjectId();
    const jobId2 = new mongoose.Types.ObjectId();
    const jobId3 = new mongoose.Types.ObjectId();
    const jobId4 = new mongoose.Types.ObjectId();
    beforeEach(async() => {
      await configManager.updateConfigsInTheSameNamespace('crowi', { 'app:bulkExportDownloadExpirationSeconds': 86400 }); // 1 day

      await PageBulkExportJob.insertMany([
        {
          _id: jobId1,
          user,
          page: new mongoose.Types.ObjectId(),
          format: PageBulkExportFormat.md,
          status: PageBulkExportJobStatus.completed,
          completedAt: new Date(Date.now()),
        },
        {
          _id: jobId2,
          user,
          page: new mongoose.Types.ObjectId(),
          format: PageBulkExportFormat.md,
          status: PageBulkExportJobStatus.completed,
          completedAt: new Date(Date.now() - 86400 * 1000 - 1),
        },
        {
          _id: jobId3, user, page: new mongoose.Types.ObjectId(), format: PageBulkExportFormat.md, status: PageBulkExportJobStatus.initializing,
        },
        {
          _id: jobId4, user, page: new mongoose.Types.ObjectId(), format: PageBulkExportFormat.md, status: PageBulkExportJobStatus.failed,
        },
      ]);
    });

    test('should delete download expired jobs', async() => {
      expect(await PageBulkExportJob.find()).toHaveLength(4);

      // act
      await pageBulkExportJobCronService?.deleteDownloadExpiredExportJobs();
      const jobs = await PageBulkExportJob.find();

      // assert
      expect(jobs).toHaveLength(3);
      expect(jobs.map(job => job._id).sort()).toStrictEqual([jobId1, jobId3, jobId4].sort());
    });
  });

  describe('deleteFailedExportJobs', () => {
    // arrange
    const jobId1 = new mongoose.Types.ObjectId();
    const jobId2 = new mongoose.Types.ObjectId();
    const jobId3 = new mongoose.Types.ObjectId();
    beforeEach(async() => {
      await PageBulkExportJob.insertMany([
        {
          _id: jobId1, user, page: new mongoose.Types.ObjectId(), format: PageBulkExportFormat.md, status: PageBulkExportJobStatus.failed,
        },
        {
          _id: jobId2, user, page: new mongoose.Types.ObjectId(), format: PageBulkExportFormat.md, status: PageBulkExportJobStatus.initializing,
        },
        {
          _id: jobId3, user, page: new mongoose.Types.ObjectId(), format: PageBulkExportFormat.md, status: PageBulkExportJobStatus.failed,
        },
      ]);
    });

    test('should delete failed export jobs', async() => {
      expect(await PageBulkExportJob.find()).toHaveLength(3);

      // act
      await pageBulkExportJobCronService?.deleteFailedExportJobs();
      const jobs = await PageBulkExportJob.find();

      // assert
      expect(jobs).toHaveLength(1);
      expect(jobs.map(job => job._id)).toStrictEqual([jobId2]);
    });
  });
});
