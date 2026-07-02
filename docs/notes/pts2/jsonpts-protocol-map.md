# jsonPTS Protocol Map

## Envelope

Типовий envelope:

```json
{
  "Protocol": "jsonPTS",
  "Packets": [
    { "Id": 1, "Type": "UploadPumpTransaction", "Data": {} }
  ]
}
```

## MVP packet groups

| Packet | Напрям | MVP дія |
| --- | --- | --- |
| `UploadPumpTransaction` | PTS -> Server | raw packet, transaction, optional card ledger |
| `UploadTankMeasurement` | PTS -> Server | tank measurement |
| `UploadInTankDelivery` | PTS -> Server | delivery |
| `UploadAlertRecord` | PTS -> Server | alert/event |
| `UploadPayment` | PTS -> Server | payment |
| `UploadShift` | PTS -> Server | shift |
| `UploadConfiguration` | PTS -> Server | configuration snapshot |
| `UploadStatus` | PTS -> Server | controller status snapshot |
| `RequestTagsInformation` | PTS -> Server | card/tag authorization |
| `TagsInformation` | Server -> PTS | response with allowed/denied tag info |

## Response rule

Server response keeps the same packet `Id`. Unknown safe upload packets should be acknowledged in MVP only if policy allows, while unknown command/control packets must not trigger side effects.

## Fixtures

Початкові fixtures живуть у `packages/pts-protocol/fixtures` і використовуються для unit/contract tests та mock PTS sender.
