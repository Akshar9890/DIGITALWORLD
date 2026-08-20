import { ShippingProvider } from "./provider.interface";
import { ShiprocketProvider } from "./shiprocket.provider";
import { DelhiveryProvider } from "./delhivery.provider";
import { ManualCourierProvider } from "./manual.provider";
import { CourierOption, CheckServiceabilityParams } from "./types";

class ShippingRegistry {
  private providers: Map<string, ShippingProvider> = new Map();

  constructor() {
    this.registerProvider(new ShiprocketProvider());
    this.registerProvider(new DelhiveryProvider());
    this.registerProvider(new ManualCourierProvider());
  }

  public registerProvider(provider: ShippingProvider): void {
    this.providers.set(provider.providerKey.toLowerCase(), provider);
  }

  public getProvider(providerKey?: string): ShippingProvider {
    const key = (providerKey || "shiprocket").toLowerCase();
    const provider = this.providers.get(key);
    if (!provider) {
      console.warn(
        `[ShippingRegistry] Provider "${providerKey}" not found. Falling back to ManualCourierProvider.`
      );
      return this.providers.get("manual")!;
    }
    return provider;
  }

  public getAllProviders(): { key: string; name: string }[] {
    return Array.from(this.providers.values()).map((p) => ({
      key: p.providerKey,
      name: p.providerName,
    }));
  }

  public async getCombinedServiceability(
    params: CheckServiceabilityParams,
    providerKey?: string
  ): Promise<CourierOption[]> {
    if (providerKey) {
      const provider = this.getProvider(providerKey);
      return await provider.checkServiceability(params);
    }

    // Try Shiprocket first (aggregator covering multiple couriers)
    try {
      const shiprocket = this.getProvider("shiprocket");
      const options = await shiprocket.checkServiceability(params);
      if (options.length > 0) return options;
    } catch (err) {
      console.error("[ShippingRegistry] Shiprocket serviceability error:", err);
    }

    // Fallback to Manual Courier Options
    const manual = this.getProvider("manual");
    return await manual.checkServiceability(params);
  }
}

export const shippingRegistry = new ShippingRegistry();
