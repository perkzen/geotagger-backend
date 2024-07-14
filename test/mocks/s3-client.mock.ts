export const mockSend = jest.fn().mockImplementation(() => {
  return {};
});

export class S3ClientMock {
  send = mockSend;
}
