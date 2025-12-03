# Upload Job Testing Guide

## Quick Start

### Running Upload Tests

```bash
# Run all upload-related tests
npm test -- --testPathPattern="upload"

# Run specific test files
npm test -- upload-job.test.ts
npm test -- upload-jobs.test.ts
npm test -- drive-items.test.ts

# Run with coverage
npm test -- --coverage --testPathPattern="upload"
```

---

## Testing Upload Workflow

### 1. Test File Upload Initiation

```typescript
// Test that uploadFiles returns UploadJob instances
const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
const result = await driveItems.uploadFiles([mockFile]);

expect(result.uploadJobs).toHaveLength(1);
expect(result.uploadJobs[0]).toBeInstanceOf(UploadJob);
expect(result.uploadJobs[0].presigned_url).toBeDefined();
expect(result.uploadJobs[0].failed_url).toBeDefined();
expect(result.uploadJobs[0].status_url).toBeDefined();
```

### 2. Test Upload Failure Handling

```typescript
// Test marking upload as failed
const uploadJob = result.uploadJobs[0];
await uploadJob.markFailed('Network timeout');

// Verify API was called with correct URL and payload
expect(mockAPIClient.POST).toHaveBeenCalledWith(
  uploadJob.failed_url,
  { error: 'Network timeout' }
);
```

### 3. Test Expiration Checking

```typescript
// Test expiration detection
const uploadJob = new UploadJob({
  id: 'upload-123',
  presigned_url_expires_at: new Date(Date.now() - 1000).toISOString(), // Expired
  // ... other fields
});

expect(uploadJob.isExpired()).toBe(true);
```

### 4. Test Upload Job Querying

```typescript
// Test getting upload jobs for a drive
const drive = await mosaia.drives.get({}, 'drive-id');
const pendingUploads = await drive.uploads.get({ status: 'PENDING' });

expect(pendingUploads.data).toBeDefined();
expect(Array.isArray(pendingUploads.data)).toBe(true);
```

---

## Mock Setup Examples

### Mock UploadJob Constructor

```typescript
jest.mock('../../models');
const MockUploadJob = UploadJob as jest.MockedClass<typeof UploadJob>;

MockUploadJob.mockImplementation((data: any) => {
  return {
    data,
    id: data.id,
    filename: data.filename,
    presigned_url: data.presigned_url,
    mime_type: data.mime_type,
    size: data.size,
    path: data.path,
    status: data.status,
    failed_url: data.failed_url,
    status_url: data.status_url,
    presigned_url_expires_at: data.presigned_url_expires_at,
    markFailed: jest.fn(),
    isExpired: jest.fn().mockReturnValue(false),
    toJSON: jest.fn().mockReturnValue(data)
  } as any;
});
```

### Mock API Response for uploadFiles

```typescript
const mockResponse = {
  message: 'Batch upload initiated',
  files: [{
    upload_job_id: 'upload-123',
    filename: 'test.pdf',
    presigned_url: 'https://s3.example.com/presigned-url',
    mime_type: 'application/pdf',
    size: 1024,
    path: '/documents/test.pdf',
    expires_in: 300,
    expires_at: '2025-12-03T20:00:00Z',
    failed_url: '/v1/drive/drive-123/upload/upload-123/failed',
    status_url: '/v1/drive/drive-123/upload/upload-123'
  }],
  instructions: {
    step1: 'Upload to S3 using presigned_url',
    step2: 'Confirmation is automatic',
    step3: 'Call failed_url on error'
  }
};

mockAPIClient.POST.mockResolvedValue({ data: mockResponse });
```

---

## Common Test Scenarios

### Scenario 1: Successful Upload Flow

```typescript
it('should handle complete upload flow', async () => {
  // 1. Initiate upload
  const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
  const result = await driveItems.uploadFiles([file]);
  const uploadJob = result.uploadJobs[0];
  
  // 2. Verify presigned URL
  expect(uploadJob.presigned_url).toBeDefined();
  expect(uploadJob.isExpired()).toBe(false);
  
  // 3. Simulate S3 upload (in real code, not in tests)
  // await fetch(uploadJob.presigned_url, { method: 'PUT', body: file });
  
  // 4. Verify upload job status
  const status = await drive.uploads.get({}, uploadJob.id);
  expect(status.status).toBe('COMPLETED');
});
```

### Scenario 2: Upload Failure

```typescript
it('should handle upload failure with quota reversion', async () => {
  const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
  const result = await driveItems.uploadFiles([file]);
  const uploadJob = result.uploadJobs[0];
  
  // Mock failure response
  mockAPIClient.POST.mockResolvedValue({
    data: {
      id: uploadJob.id,
      status: 'FAILED',
      error_summary: 'Network error',
      message: 'Upload marked as failed and quota reverted'
    }
  });
  
  // Mark as failed
  await uploadJob.markFailed('Network error');
  
  // Verify API call
  expect(mockAPIClient.POST).toHaveBeenCalledWith(
    uploadJob.failed_url,
    { error: 'Network error' }
  );
});
```

### Scenario 3: Expired Presigned URL

```typescript
it('should detect expired presigned URL', async () => {
  const expiredJob = new UploadJob({
    id: 'upload-expired',
    presigned_url: 'https://s3.example.com/expired',
    presigned_url_expires_at: new Date(Date.now() - 60000).toISOString(), // 1 min ago
    // ... other fields
  });
  
  expect(expiredJob.isExpired()).toBe(true);
  
  // In real code, you'd mark it as failed
  // await expiredJob.markFailed('Presigned URL expired');
});
```

### Scenario 4: Multiple File Upload

```typescript
it('should handle multiple file uploads', async () => {
  const files = [
    new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
    new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
  ];
  
  const mockResponse = {
    message: 'Batch upload initiated',
    files: files.map((file, index) => ({
      upload_job_id: `upload-${index + 1}`,
      filename: file.name,
      presigned_url: `https://s3.example.com/upload-${index + 1}`,
      mime_type: file.type,
      size: file.size,
      path: `/${file.name}`,
      expires_in: 300,
      expires_at: new Date(Date.now() + 300000).toISOString(),
      failed_url: `/v1/drive/drive-123/upload/upload-${index + 1}/failed`,
      status_url: `/v1/drive/drive-123/upload/upload-${index + 1}`
    })),
    instructions: {}
  };
  
  mockAPIClient.POST.mockResolvedValue({ data: mockResponse });
  
  const result = await driveItems.uploadFiles(files);
  
  expect(result.uploadJobs).toHaveLength(2);
  expect(result.uploadJobs[0].filename).toBe('file1.pdf');
  expect(result.uploadJobs[1].filename).toBe('file2.pdf');
});
```

---

## Assertion Patterns

### Verify UploadJob Properties

```typescript
expect(uploadJob.id).toBe('upload-123');
expect(uploadJob.filename).toBe('document.pdf');
expect(uploadJob.mime_type).toBe('application/pdf');
expect(uploadJob.size).toBe(1024);
expect(uploadJob.path).toBe('/documents');
expect(uploadJob.status).toBe('PENDING');
expect(uploadJob.presigned_url).toMatch(/^https:\/\/s3/);
expect(uploadJob.failed_url).toMatch(/\/failed$/);
expect(uploadJob.status_url).toMatch(/\/upload\/upload-123$/);
```

### Verify API Calls

```typescript
// Verify POST to failed endpoint
expect(mockAPIClient.POST).toHaveBeenCalledWith(
  expect.stringMatching(/\/failed$/),
  expect.objectContaining({ error: expect.any(String) })
);

// Verify GET for status
expect(mockAPIClient.GET).toHaveBeenCalledWith(
  expect.stringMatching(/\/upload\/upload-\d+$/)
);
```

---

## Debugging Tips

### 1. Check Mock Configuration

```typescript
// Verify mock is being called
console.log('MockUploadJob calls:', MockUploadJob.mock.calls);
console.log('API POST calls:', mockAPIClient.POST.mock.calls);
```

### 2. Inspect Response Data

```typescript
const result = await driveItems.uploadFiles([file]);
console.log('Upload result:', JSON.stringify(result, null, 2));
console.log('First upload job:', result.uploadJobs[0]);
```

### 3. Test Error Handling

```typescript
// Test with rejected promise
mockAPIClient.POST.mockRejectedValue(new Error('Network error'));

await expect(uploadJob.markFailed('Test')).rejects.toThrow('Network error');
```

---

## Best Practices

1. **Always mock API responses** - Don't make real API calls in tests
2. **Test both success and error paths** - Cover happy path and edge cases
3. **Verify API call parameters** - Check URLs and payloads are correct
4. **Test expiration logic** - Use past/future dates to test expiration
5. **Clean up mocks** - Use `beforeEach` to reset mocks between tests
6. **Use descriptive test names** - Make it clear what scenario is being tested
7. **Test instance methods** - Verify `markFailed()`, `isExpired()`, etc. work correctly

---

## Related Files

- Test files: `src/__tests__/models/upload-job.test.ts`
- Test files: `src/__tests__/collections/upload-jobs.test.ts`
- Test files: `src/__tests__/collections/drive-items.test.ts`
- Test files: `src/__tests__/models/drive.test.ts`
- Implementation: `src/models/upload-job.ts`
- Implementation: `src/collections/upload-jobs.ts`
- Implementation: `src/collections/drive-items.ts`

---

## Need Help?

- Check `TEST_SUMMARY.md` for comprehensive test coverage overview
- Review existing tests in `__tests__` directory for patterns
- Refer to Jest documentation: https://jestjs.io/docs/getting-started

