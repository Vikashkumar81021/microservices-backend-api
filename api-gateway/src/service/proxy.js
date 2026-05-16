import { config } from "../config/index.js";
import { logger } from "../config/logger.js";
import { ServiceUnavailableError } from "../utils/error.js";
class CircuitBreaker {
  constructor(
    serviceName,
    threshold = config.CIRCUIT_BREAKER_THRESHOLD,
    timeout = config.CIRCUIT_BREAKER_TIMEOUT,
  ) {
    this.serviceName = serviceName;
    this.threshold = threshold;
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = "CLOSED";
    this.nextAttmptCount = Date.now();
  }
  async execut(request) {
    if (this.state == "OPEN") {
      if (Date.now() < this.nextAttmptCount) {
        throw new ServiceUnavailableError(
          `Service${this.serviceName} is temporarily unavailable`,
        );
      }
      //try to close circuit
      this.state = "HALF_OPEN";
      logger.info(`Circuit Breaker HALF_OPEN for ${this.serviceName}`);
    }
    try {
      const resp = await request();
      this.onSuccess();
      return resp;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  async onSuccess() {
    this.failureCount = 0;
    if (this.state === "HALF_OPEN") {
      this.state = "CLOSED";
      logger.info(`Circuit CLOSED for ${this.serviceName}`);
    }
  }
  async onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = "OPEN";
      this.nextAttmptCount = Date.now() + this.timeout;
      logger.error(`Circuit OPEN for ${this.serviceName}`);
    }
  }
}
