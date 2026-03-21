export interface ContractMetadata {
  detectedPrice?: number;
  detectedCurrency?: string;
  detectedScope?: string;
  detectedParties?: { client?: string; contractor?: string };
  detectedPaymentTerms?: string;
  estimatedHours?: number;
  contractType?: string;
}

export function extractMetadataFromText(text: string): ContractMetadata {
  const result: ContractMetadata = {};

  // Detect currency
  if (/\u20b9|Rs\.?|rupee|INR/i.test(text)) result.detectedCurrency = 'INR';
  else if (/\u00a3|GBP|pound/i.test(text)) result.detectedCurrency = 'GBP';
  else if (/\u20ac|EUR|euro/i.test(text)) result.detectedCurrency = 'EUR';
  else if (/A\$|AUD/i.test(text)) result.detectedCurrency = 'AUD';
  else if (/C\$|CAD/i.test(text)) result.detectedCurrency = 'CAD';
  else if (/\$|USD|dollar/i.test(text)) result.detectedCurrency = 'USD';

  // Detect price — look for the LARGEST monetary amount (usually the total)
  const pricePatterns = [
    /(?:total|project|flat|fixed)\s+(?:fee|price|cost|amount|value)[\s:]*(?:of\s+)?(?:Rs\.?|\u20b9|\$|\u00a3|\u20ac|USD|INR|GBP|EUR)?\s*([0-9,]+(?:\.\d{1,2})?)/gi,
    /(?:Rs\.?|\u20b9)\s*([0-9,]+(?:\.\d{1,2})?)/gi,
    /(?:\$|USD\s*)([0-9,]+(?:\.\d{1,2})?)/gi,
    /(?:\u00a3|GBP\s*)([0-9,]+(?:\.\d{1,2})?)/gi,
    /(?:\u20ac|EUR\s*)([0-9,]+(?:\.\d{1,2})?)/gi,
    /([0-9,]+(?:\.\d{1,2})?)\s*(?:USD|INR|GBP|EUR|rupees|dollars|pounds|euros)/gi,
  ];

  const amounts: number[] = [];
  for (const pattern of pricePatterns) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val > 10 && val < 100000000) amounts.push(val); // reasonable range
    }
  }

  // The largest amount is likely the total project cost
  if (amounts.length > 0) {
    amounts.sort((a, b) => b - a);
    result.detectedPrice = amounts[0];
  }

  // Detect parties
  const clientPatterns = [
    /(?:between|by and between)\s+([A-Z][A-Za-z\s,.]+?)(?:\s*\(.*?(?:client|company|employer|customer).*?\))/i,
    /(?:client|company|employer)\s*[:\-]?\s*([A-Z][A-Za-z\s,.]+?)(?:\n|,|\()/i,
  ];
  const contractorPatterns = [
    /(?:contractor|freelancer|consultant|designer|developer)\s*[:\-]?\s*([A-Z][A-Za-z\s,.]+?)(?:\n|,|\()/i,
  ];

  for (const p of clientPatterns) {
    const m = text.match(p);
    if (m) { result.detectedParties = { ...result.detectedParties, client: m[1].trim() }; break; }
  }
  for (const p of contractorPatterns) {
    const m = text.match(p);
    if (m) { result.detectedParties = { ...result.detectedParties, contractor: m[1].trim() }; break; }
  }

  // Detect scope from "services" or "scope" section
  const scopePatterns = [
    /(?:scope\s+of\s+(?:work|services)|description\s+of\s+services|services\s+(?:provided|to\s+be\s+provided))[\s:]+([\s\S]{30,300}?)(?:\.\s*[A-Z]|\n\n)/i,
    /(?:contractor|freelancer)\s+(?:shall|will|agrees?\s+to)\s+(?:provide|perform|deliver|develop|design|build|create)\s+([\s\S]{20,200}?)(?:\.\s)/i,
  ];

  for (const p of scopePatterns) {
    const m = text.match(p);
    if (m) {
      result.detectedScope = m[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
      break;
    }
  }

  // Detect contract type
  const lower = text.toLowerCase();
  if (/per\s*word|\/\s*word|per\s+article/i.test(lower)) result.contractType = 'per-unit';
  else if (/(?:day\s+rate|daily\s+rate|per\s+day)/i.test(lower)) result.contractType = 'day-rate';
  else if (/(?:monthly\s+retainer|retainer\s+(?:agreement|fee))/i.test(lower)) result.contractType = 'retainer';
  else if (/(?:hourly\s+rate|per\s+hour|\/\s*hr)/i.test(lower)) result.contractType = 'hourly';
  else if (/milestone|phase\s+\d|\d+%\s*(?:upon|at|on|deposit|advance)/i.test(lower)) result.contractType = 'milestone';
  else result.contractType = 'fixed-price';

  // Estimate hours based on price and contract type
  if (result.detectedPrice) {
    if (result.contractType === 'hourly') {
      const rateMatch = text.match(/(?:\$|Rs\.?|\u20b9|\u00a3|\u20ac)\s*([0-9,]+(?:\.\d{1,2})?)\s*(?:per\s+hour|\/\s*hr)/i);
      if (rateMatch) {
        const rate = parseFloat(rateMatch[1].replace(/,/g, ''));
        if (rate > 0) result.estimatedHours = Math.round(result.detectedPrice / rate);
      }
    } else {
      // Rough estimate: $50-150/hr depending on price range
      const avgRate = result.detectedPrice > 50000 ? 50 : result.detectedPrice > 10000 ? 80 : 100;
      result.estimatedHours = Math.round(result.detectedPrice / avgRate);
    }
  }

  // Detect payment terms
  const paymentMatch = text.match(/(?:payment|paid|due|payable)\s+(?:within|in)\s+(\d+)\s+(?:day|business\s+day)/i);
  if (paymentMatch) {
    result.detectedPaymentTerms = `Net-${paymentMatch[1]}`;
  }
  // Also check for Net-XX pattern
  if (!result.detectedPaymentTerms) {
    const netMatch = text.match(/Net[- ](\d+)/i);
    if (netMatch) {
      result.detectedPaymentTerms = `Net-${netMatch[1]}`;
    }
  }

  return result;
}
