# Data Structure

```ts
type DS = {
  forms: Array<{
    name: string;
    id: string;
    form_data: unknown[];
    createdAt: string;
    automation: Array<{
      name: string;
      id: string;
      type: "EMAIL";
      meta: {
        provider: string;
        secret: {
          api_key: string;
        };
      };
      trigger: AutomationTriggers[];
    }>;
  }>;
};

type AutomationTriggers = "ON_CREATE" | "ON_DELETE";
```
